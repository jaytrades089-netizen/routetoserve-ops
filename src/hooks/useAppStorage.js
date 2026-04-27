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

const IDEAS_KEY     = 'rts_app_ideas'
const ISSUES_KEY    = 'rts_app_all_bugs' // offline cache for unified bug list

const SERVER_URL    = 'http://localhost:3001'
const POLL_INTERVAL = 30_000

// Maps appData stage names → Drive category folder names
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

// ── Seed helper: convert appData items → Drive bug format ─────────────────
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

// ── Sprint Items (Drive-backed, unified with logged issues) ────────────────
export function useSprintItems() {
  const [items, setItems]         = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')
  const pendingWrite              = useRef(false)
  const seeded                    = useRef(false)

  // Initial load: try Drive first, fall back to appData defaults
  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      try {
        const driveItems = await fetchBugsFromServer()

        if (driveItems.length === 0 && !seeded.current) {
          // First run — seed Drive with current appData items
          seeded.current = true
          const seedData = sprintItemsToBugs(DEFAULT_SPRINT_ITEMS)
          await seedBugsToServer(seedData)
          if (!cancelled) {
            setItems(seedData)
            lsSave(ISSUES_KEY, seedData)
            setSyncStatus('synced')
          }
        } else {
          if (!cancelled) {
            setItems(driveItems)
            lsSave(ISSUES_KEY, driveItems)
            setSyncStatus('synced')
          }
        }
      } catch {
        // Offline — fall back to localStorage, then appData defaults
        const cached = lsLoad(ISSUES_KEY, null)
        if (!cancelled) {
          if (cached && cached.length > 0) {
            setItems(cached)
          } else {
            setItems(sprintItemsToBugs(DEFAULT_SPRINT_ITEMS))
          }
          setSyncStatus('offline')
        }
      }
    }

    initialLoad()
    return () => { cancelled = true }
  }, [])

  // 30-second poll
  useEffect(() => {
    const timer = setInterval(async () => {
      if (pendingWrite.current) return
      try {
        const driveItems = await fetchBugsFromServer()
        setItems(prev => {
          const driveIds  = new Set(driveItems.map(i => i.id))
          const localOnly = prev.filter(i => !driveIds.has(i.id))
          return [...driveItems, ...localOnly]
        })
        lsSave(ISSUES_KEY, driveItems)
        setSyncStatus('synced')
      } catch {
        setSyncStatus('offline')
      }
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  // Write helper
  async function persistItems(updated) {
    setItems(updated)
    lsSave(ISSUES_KEY, updated)
    pendingWrite.current = true
    try {
      await saveBugsToServer(updated)
      setSyncStatus('synced')
    } catch {
      setSyncStatus('offline')
    } finally {
      pendingWrite.current = false
    }
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

  // Filter helpers for the existing stage-based UI
  const getByStage = useCallback((stage) => {
    if (!stage) return items
    return items.filter(i => i.stage === stage)
  }, [items])

  return { items, syncStatus, updateStatus, updateNotes, getByStage }
}

// ── App Ideas (localStorage) ───────────────────────────────────────────────
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

// ── Logged Issues (alias for useSprintItems for backward compatibility) ────
// The dashboard's LoggedIssues component uses this hook.
// Now all items — sprint + logged — live in the same Drive-backed store.
export function useLoggedIssues() {
  const [issues, setIssues]         = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')
  const pendingWrite                = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const driveItems = await fetchBugsFromServer()
        if (!cancelled) {
          setIssues(driveItems)
          lsSave(ISSUES_KEY, driveItems)
          setSyncStatus('synced')
        }
      } catch {
        const cached = lsLoad(ISSUES_KEY, [])
        if (!cancelled) { setIssues(cached); setSyncStatus('offline') }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const timer = setInterval(async () => {
      if (pendingWrite.current) return
      try {
        const driveItems = await fetchBugsFromServer()
        setIssues(prev => {
          const driveIds  = new Set(driveItems.map(i => i.id))
          const localOnly = prev.filter(i => !driveIds.has(i.id))
          return [...driveItems, ...localOnly]
        })
        setSyncStatus('synced')
      } catch { setSyncStatus('offline') }
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  async function persistIssues(updated) {
    setIssues(updated)
    lsSave(ISSUES_KEY, updated)
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
