/**
 * useAppStorage.base44.js
 * ─────────────────────────────────────────────────────────────────────────
 * READY TO DEPLOY — waiting on Base44 credits to create entities.
 *
 * TO ACTIVATE:
 *   1. Create SprintItem entity in Base44 Data tab with fields:
 *      title, stage, what, why, file, blockedBy, priority, status,
 *      notes, category, seedId, createdAt  (all Text)
 *
 *   2. Create FieldReport entity in Base44 Data tab with fields:
 *      title, type, priority, what, why, file,
 *      screenshotDescription, status, category, createdAt  (all Text)
 *
 *   3. Copy this file over useAppStorage.js and push to GitHub.
 *      Base44 auto-deploys. Done.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { base44 } from '../api/base44Client'
import { DEFAULT_SPRINT_ITEMS, DEFAULT_APP_IDEAS } from '../data/appData'

const IDEAS_KEY     = 'rts_app_ideas'
const SPRINT_CACHE  = 'rts_sprint_cache'
const ISSUES_CACHE  = 'rts_issues_cache'
const POLL_INTERVAL = 30_000

const STAGE_TO_CATEGORY = {
  'Stability Sprint': 'Stability',
  'Pinned Features':  'Features',
  'On The Horizon':   'Horizon',
}

function lsLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function lsSave(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

async function fetchSprintItemsFromBase44() {
  const items = await base44.entities.SprintItem.list()
  return items || []
}

async function fetchFieldReportsFromBase44() {
  const reports = await base44.entities.FieldReport.list()
  return reports || []
}

function sprintItemsToBase44Format(items) {
  return items.map(item => ({
    title:     item.title,
    stage:     item.stage,
    what:      item.what,
    why:       item.why,
    file:      item.file || '',
    blockedBy: item.blockedBy || '',
    priority:  item.priority,
    status:    item.status,
    notes:     item.notes || '',
    category:  STAGE_TO_CATEGORY[item.stage] || 'Stability',
    seedId:    item.id,
    createdAt: new Date().toISOString(),
  }))
}

export function useSprintItems() {
  const [items, setItems]           = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')
  const pendingWrite                = useRef(false)
  const seeded                      = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function initialLoad() {
      try {
        const base44Items = await fetchSprintItemsFromBase44()
        if (base44Items.length === 0 && !seeded.current) {
          seeded.current = true
          const seedData = sprintItemsToBase44Format(DEFAULT_SPRINT_ITEMS)
          const created  = await Promise.all(
            seedData.map(item => base44.entities.SprintItem.create(item))
          )
          if (!cancelled) {
            setItems(created)
            lsSave(SPRINT_CACHE, created)
            setSyncStatus('synced')
          }
        } else {
          if (!cancelled) {
            setItems(base44Items)
            lsSave(SPRINT_CACHE, base44Items)
            setSyncStatus('synced')
          }
        }
      } catch (err) {
        console.warn('useSprintItems: Base44 unavailable, falling back to cache', err?.message)
        const cached = lsLoad(SPRINT_CACHE, null)
        if (!cancelled) {
          setItems(cached && cached.length > 0
            ? cached
            : sprintItemsToBase44Format(DEFAULT_SPRINT_ITEMS)
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
        const base44Items = await fetchSprintItemsFromBase44()
        if (base44Items.length > 0) {
          setItems(base44Items)
          lsSave(SPRINT_CACHE, base44Items)
          setSyncStatus('synced')
        }
      } catch { setSyncStatus('offline') }
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  const updateStatus = useCallback(async (id, status) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    pendingWrite.current = true
    try {
      await base44.entities.SprintItem.update(id, { status })
      setSyncStatus('synced')
    } catch { setSyncStatus('offline') }
    finally { pendingWrite.current = false }
  }, [])

  const updateNotes = useCallback(async (id, notes) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i))
    pendingWrite.current = true
    try {
      await base44.entities.SprintItem.update(id, { notes })
      setSyncStatus('synced')
    } catch { setSyncStatus('offline') }
    finally { pendingWrite.current = false }
  }, [])

  const getByStage = useCallback((stage) => {
    if (!stage) return items
    return items.filter(i => i.stage === stage)
  }, [items])

  return { items, syncStatus, updateStatus, updateNotes, getByStage }
}

export function useAppIdeas() {
  const [ideas, setIdeas] = useState(() => lsLoad(IDEAS_KEY, DEFAULT_APP_IDEAS))
  useEffect(() => { lsSave(IDEAS_KEY, ideas) }, [ideas])

  const addIdea = useCallback((title, description) => {
    const idea = {
      id: `app-idea-${Date.now()}`, title, description,
      status: 'parked', notes: '', createdAt: new Date().toISOString(),
    }
    setIdeas(prev => [...prev, idea])
    return idea
  }, [])

  const updateIdea = useCallback((id, updates) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [])

  return { ideas, addIdea, updateIdea }
}

export function useLoggedIssues() {
  const [issues, setIssues]         = useState([])
  const [syncStatus, setSyncStatus] = useState('loading')
  const pendingWrite                = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const reports = await fetchFieldReportsFromBase44()
        if (!cancelled) {
          setIssues(reports)
          lsSave(ISSUES_CACHE, reports)
          setSyncStatus('synced')
        }
      } catch (err) {
        console.warn('useLoggedIssues: Base44 unavailable, falling back to cache', err?.message)
        const cached = lsLoad(ISSUES_CACHE, [])
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
        const reports = await fetchFieldReportsFromBase44()
        setIssues(reports)
        lsSave(ISSUES_CACHE, reports)
        setSyncStatus('synced')
      } catch { setSyncStatus('offline') }
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  const addIssue = useCallback(async (formatted) => {
    const issue = {
      title:               formatted.title     || '',
      type:                formatted.type      || 'bug',
      priority:            formatted.priority  || 'medium',
      what:                formatted.what      || '',
      why:                 formatted.why       || '',
      file:                formatted.file      || '',
      screenshotDescription: formatted.screenshotDescription || '',
      status:              'todo',
      category:            formatted.category  || 'Stability',
      createdAt:           new Date().toISOString(),
    }
    pendingWrite.current = true
    try {
      const created = await base44.entities.FieldReport.create(issue)
      setIssues(prev => { const u = [created, ...prev]; lsSave(ISSUES_CACHE, u); return u })
      setSyncStatus('synced')
      return created
    } catch (err) {
      console.warn('addIssue: Base44 write failed', err?.message)
      const fallback = { ...issue, id: `temp-${Date.now()}` }
      setIssues(prev => { const u = [fallback, ...prev]; lsSave(ISSUES_CACHE, u); return u })
      setSyncStatus('offline')
      return fallback
    } finally { pendingWrite.current = false }
  }, [])

  const updateIssueStatus = useCallback(async (id, status) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    if (String(id).startsWith('temp-')) return
    pendingWrite.current = true
    try {
      await base44.entities.FieldReport.update(id, { status })
      setSyncStatus('synced')
    } catch { setSyncStatus('offline') }
    finally { pendingWrite.current = false }
  }, [])

  const removeIssue = useCallback(async (id) => {
    setIssues(prev => { const u = prev.filter(i => i.id !== id); lsSave(ISSUES_CACHE, u); return u })
    if (String(id).startsWith('temp-')) return
    pendingWrite.current = true
    try {
      await base44.entities.FieldReport.delete(id)
      setSyncStatus('synced')
    } catch { setSyncStatus('offline') }
    finally { pendingWrite.current = false }
  }, [])

  return { issues, syncStatus, addIssue, updateIssueStatus, removeIssue }
}
