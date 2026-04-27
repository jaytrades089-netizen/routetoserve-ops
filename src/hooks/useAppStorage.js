/**
 * useAppStorage.js
 * Drive-backed state for the RouteToServe App tab.
 *
 * Sprint items → Drive subfolders by category:
 *   Stability Sprint  → Bug Reports/Stability
 *   Pinned Features   → Bug Reports/Features
 *   On The Horizon    → Bug Reports/Horizon
 *
 * All items sync two-way with Drive via the local Express server.
 * localStorage is used only as an offline fallback.
 *
 * NOTE: Base44 entity migration is ready and waiting.
 * When Base44 credits renew, create SprintItem + FieldReport entities,
 * then swap this file with useAppStorage.base44.js (already written).
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { DEFAULT_SPRINT_ITEMS, DEFAULT_APP_IDEAS } from '../data/appData'

const IDEAS_KEY         = 'rts_app_ideas'
const SPRINT_KEY        = 'rts_sprint_items'
const FIELD_REPORTS_KEY = 'rts_field_reports'
const LEGACY_KEY        = 'rts_app_all_bugs'  // old key — migrated on first load

const SERVER_URL    = 'http://localhost:3001'
const POLL_INTERVAL = 30_000

const STAGE_TO_CATEGORY = {
  'Stability Sprint': 'Stability',
  'Pinned Features':  'Features',
  'On The Horizon':   'Horizon',
}

// ── localStorage helpers ───────────────────────────────────────────────────
function lsLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function lsSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ── One-time migration from legacy key ────────────────────────────────────
// The old code stored everything under rts_app_all_bugs — sprint items AND
// field reports mixed together. This runs once on load, splits them out into
// their correct keys, and clears the legacy key so it never runs again.
function runLegacyMigration() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (!legacy) return // already migrated or nothing to migrate

    const all = JSON.parse(legacy)
    if (!Array.isArray(all) || all.length === 0) {
      localStorage.removeItem(LEGACY_KEY)
      return
    }

    // Items with a stage field are sprint items, everything else is a field report
    const sprintItems   = all.filter(i => i.stage)
    const fieldReports  = all.filter(i => !i.stage)

    // Only write to new keys if the new keys are currently empty
    // (avoids overwriting if migration already partially ran)
    if (sprintItems.length > 0 && !localStorage.getItem(SPRINT_KEY)) {
      lsSave(SPRINT_KEY, sprintItems)
    }
    if (fieldReports.length > 0 && !localStorage.getItem(FIELD_REPORTS_KEY)) {
      lsSave(FIELD_REPORTS_KEY, fieldReports)
    }

    // Clear legacy key so this never runs again
    localStorage.removeItem(LEGACY_KEY)
    console.log(`[Migration] Moved ${sprintItems.length} sprint items + ${fieldReports.length} field reports from legacy key.`)
  } catch (err) {
    console.warn('[Migration] Failed:', err.message)
  }
}

// Run migration immediately when this module loads
runLegacyMigration()

// ── Drive API helpers ──────────────────────────────────────────────────────
async function fetchBugsFromServer() {
  const res = await fetch(`${SERVER_URL}/api/bugs`)
  if (!res.ok) throw new Error(`Server returned ${res.status}`)
  const data = await res.json()
  return data.bugs || []
}

async function saveBugsToServer(bugs) {
  const res = await fetch(`${SERVER_URL}/api/bugs`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ bugs }),
  })
  if (!res.ok) throw new Error(`Server returned ${res.status}`)
  return res.json()
}

async function seedBugsToServer(bugs) {
  const res = await fetch(`${SERVER_URL}/api/bugs/seed`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ bugs }),
  })
  if (!res.ok) throw new Error(`Server returned ${res.status}`)
  return res.json()
}

function sprintItemsToBugs(items) {
  return items.map(item => ({
    id:        item.id,
    title:     item.title,
    what:      item.what,
    why:       item.why,
    file:      item.file,
    blockedBy: item.blockedBy,
    priority:  item.priority,
    status:    item.status,
    notes:     item.notes,
    stage:     item.stage,
    category:  STAGE_TO_CATEGORY[item.stage] || 'Stability',
    createdAt: new Date().toISOString(),
  }))
}

// ── Sprint Items ───────────────────────────────────────────────────────────
export function useSprintItems() {
  const [items, setItems]           = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')
  const pendingWrite                = useRef(false)
  const seeded                      = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      try {
        const driveItems = await fetchBugsFromServer()
        const sprintOnly = driveItems.filter(i => i.stage)

        if (sprintOnly.length === 0 && !seeded.current) {
          seeded.current = true
          const seedData = sprintItemsToBugs(DEFAULT_SPRINT_ITEMS)
          await seedBugsToServer(seedData)
          if (!cancelled) {
            setItems(seedData)
            lsSave(SPRINT_KEY, seedData)
            setSyncStatus('synced')
          }
        } else {
          if (!cancelled) {
            setItems(sprintOnly)
            lsSave(SPRINT_KEY, sprintOnly)
            setSyncStatus('synced')
          }
        }
      } catch {
        const cached = lsLoad(SPRINT_KEY, null)
        if (!cancelled) {
          setItems(cached && cached.length > 0
            ? cached
            : sprintItemsToBugs(DEFAULT_SPRINT_ITEMS)
          )
          setSyncStatus('offline')
        }
      }
    }

    initialLoad()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const timer = setInterval(async () => {
      if (pendingWrite.current) return
      try {
        const driveItems = await fetchBugsFromServer()
        const sprintOnly = driveItems.filter(i => i.stage)
        setItems(prev => {
          const driveIds  = new Set(sprintOnly.map(i => i.id))
          const localOnly = prev.filter(i => !driveIds.has(i.id))
          return [...sprintOnly, ...localOnly]
        })
        lsSave(SPRINT_KEY, sprintOnly)
        setSyncStatus('synced')
      } catch { setSyncStatus('offline') }
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  async function persistItems(updated) {
    setItems(updated)
    lsSave(SPRINT_KEY, updated)
    pendingWrite.current = true
    try {
      await saveBugsToServer(updated)
      setSyncStatus('synced')
    } catch { setSyncStatus('offline') }
    finally { pendingWrite.current = false }
  }

  const updateStatus = useCallback((id, status) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, status } : i)
      persistItems(updated)
      return updated
    })
  }, [])

  const updateNotes = useCallback((id, notes) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, notes } : i)
      persistItems(updated)
      return updated
    })
  }, [])

  const getByStage = useCallback((stage) => {
    if (!stage) return items
    return items.filter(i => i.stage === stage)
  }, [items])

  return { items, syncStatus, updateStatus, updateNotes, getByStage }
}

// ── App Ideas ──────────────────────────────────────────────────────────────
export function useAppIdeas() {
  const [ideas, setIdeas] = useState(() => lsLoad(IDEAS_KEY, DEFAULT_APP_IDEAS))

  useEffect(() => { lsSave(IDEAS_KEY, ideas) }, [ideas])

  const addIdea = useCallback((title, description) => {
    const idea = {
      id:        `app-idea-${Date.now()}`,
      title,
      description,
      status:    'parked',
      notes:     '',
      createdAt: new Date().toISOString(),
    }
    setIdeas(prev => [...prev, idea])
    return idea
  }, [])

  const updateIdea = useCallback((id, updates) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [])

  return { ideas, addIdea, updateIdea }
}

// ── Logged Issues / Field Reports ──────────────────────────────────────────
// Loads from localStorage immediately — field reports always show on load.
// Tries Drive in the background to pick up any server-synced reports.
export function useLoggedIssues() {
  const [issues, setIssues]         = useState(() => lsLoad(FIELD_REPORTS_KEY, []))
  const [syncStatus, setSyncStatus] = useState('offline')
  const pendingWrite                = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function syncFromDrive() {
      try {
        const driveItems  = await fetchBugsFromServer()
        const reportsOnly = driveItems.filter(i => !i.stage)
        if (!cancelled && reportsOnly.length > 0) {
          setIssues(prev => {
            const driveIds  = new Set(reportsOnly.map(i => i.id))
            const localOnly = prev.filter(i => !driveIds.has(i.id))
            const merged    = [...reportsOnly, ...localOnly]
            lsSave(FIELD_REPORTS_KEY, merged)
            return merged
          })
          setSyncStatus('synced')
        }
      } catch {
        // Server unavailable — localStorage data already showing
      }
    }

    syncFromDrive()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const timer = setInterval(async () => {
      if (pendingWrite.current) return
      try {
        const driveItems  = await fetchBugsFromServer()
        const reportsOnly = driveItems.filter(i => !i.stage)
        if (reportsOnly.length > 0) {
          setIssues(prev => {
            const driveIds  = new Set(reportsOnly.map(i => i.id))
            const localOnly = prev.filter(i => !driveIds.has(i.id))
            const merged    = [...reportsOnly, ...localOnly]
            lsSave(FIELD_REPORTS_KEY, merged)
            return merged
          })
          setSyncStatus('synced')
        }
      } catch { setSyncStatus('offline') }
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  async function persistIssues(updated) {
    lsSave(FIELD_REPORTS_KEY, updated)
    pendingWrite.current = true
    try {
      await saveBugsToServer(updated)
      setSyncStatus('synced')
    } catch { setSyncStatus('offline') }
    finally { pendingWrite.current = false }
  }

  const addIssue = useCallback(async (formatted) => {
    const issue = {
      ...formatted,
      id:        `issue-${Date.now()}`,
      status:    'todo',
      category:  formatted.category || 'Stability',
      createdAt: new Date().toISOString(),
    }
    setIssues(prev => {
      const updated = [issue, ...prev]
      persistIssues(updated)
      return updated
    })
    return issue
  }, [])

  const updateIssueStatus = useCallback(async (id, status) => {
    setIssues(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, status } : i)
      persistIssues(updated)
      return updated
    })
  }, [])

  const removeIssue = useCallback(async (id) => {
    setIssues(prev => {
      const updated = prev.filter(i => i.id !== id)
      persistIssues(updated)
      return updated
    })
  }, [])

  return { issues, syncStatus, addIssue, updateIssueStatus, removeIssue }
}
