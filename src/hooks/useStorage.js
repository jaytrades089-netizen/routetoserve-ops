import { useState, useEffect, useCallback } from 'react'
import { CHECKLIST_STEPS, DEFAULT_IDEAS, DEFAULT_METRICS } from '../data/checklistData'

const KEYS = {
  CHECKLIST:  'rts_checklist',
  IDEAS:      'rts_ideas',
  DECISIONS:  'rts_decisions',
  METRICS:    'rts_metrics',
  MILESTONE:  'rts_last_milestone',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ── Checklist ──────────────────────────────────────────────────────────────
export function useChecklist() {
  const [statuses, setStatuses] = useState(() => {
    const stored = load(KEYS.CHECKLIST, {})
    const init = {}
    CHECKLIST_STEPS.forEach(s => {
      init[s.id] = stored[s.id] ?? { status: 'todo', notes: '', doneDate: null }
    })
    return init
  })

  useEffect(() => { save(KEYS.CHECKLIST, statuses) }, [statuses])

  const updateStatus = useCallback((id, status) => {
    setStatuses(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
        doneDate: status === 'done' ? new Date().toISOString() : prev[id]?.doneDate,
      },
    }))
  }, [])

  const updateNotes = useCallback((id, notes) => {
    setStatuses(prev => ({ ...prev, [id]: { ...prev[id], notes } }))
  }, [])

  const doneCount   = Object.values(statuses).filter(s => s.status === 'done').length
  const totalCount  = CHECKLIST_STEPS.length
  const currentStep = CHECKLIST_STEPS.find(s => statuses[s.id]?.status !== 'done') ?? null

  return { statuses, updateStatus, updateNotes, doneCount, totalCount, currentStep }
}

// ── Ideas ──────────────────────────────────────────────────────────────────
export function useIdeas() {
  const [ideas, setIdeas] = useState(() => load(KEYS.IDEAS, DEFAULT_IDEAS))

  useEffect(() => { save(KEYS.IDEAS, ideas) }, [ideas])

  const addIdea = useCallback((title, description) => {
    const idea = {
      id: `idea-${Date.now()}`,
      title,
      description,
      status: 'parked',
      notes: '',
      createdAt: new Date().toISOString(),
      blueprintStarted: false,
    }
    setIdeas(prev => [...prev, idea])
    return idea
  }, [])

  const updateIdea = useCallback((id, updates) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [])

  return { ideas, addIdea, updateIdea }
}

// ── Decisions ──────────────────────────────────────────────────────────────
export function useDecisions() {
  const [decisions, setDecisions] = useState(() => load(KEYS.DECISIONS, []))

  useEffect(() => { save(KEYS.DECISIONS, decisions) }, [decisions])

  const addDecision = useCallback((title, context, decisionText, rationale) => {
    const d = {
      id: `decision-${Date.now()}`,
      title,
      context,
      decisionText,
      rationale,
      decidedAt: new Date().toISOString(),
    }
    setDecisions(prev => [d, ...prev])
    return d
  }, [])

  return { decisions, addDecision }
}

// ── Metrics ────────────────────────────────────────────────────────────────
export function useMetrics() {
  const [metrics, setMetrics] = useState(() => load(KEYS.METRICS, DEFAULT_METRICS))

  useEffect(() => { save(KEYS.METRICS, metrics) }, [metrics])

  const updateMetric = useCallback((id, value) => {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, value } : m))
  }, [])

  return { metrics, updateMetric }
}

// ── Last milestone ─────────────────────────────────────────────────────────
export function useMilestone() {
  const [lastMilestone, setLastMilestone] = useState(() => load(KEYS.MILESTONE, null))

  const markMilestone = useCallback(() => {
    const now = new Date().toISOString()
    setLastMilestone(now)
    save(KEYS.MILESTONE, now)
  }, [])

  const daysSince = lastMilestone
    ? Math.floor((Date.now() - new Date(lastMilestone).getTime()) / 86400000)
    : 0

  return { daysSince, markMilestone }
}
