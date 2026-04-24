import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_SPRINT_ITEMS, DEFAULT_APP_IDEAS } from '../data/appData'

const KEYS = {
  SPRINT_ITEMS: 'rts_app_sprint',
  APP_IDEAS:    'rts_app_ideas',
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

// ── Sprint Items ───────────────────────────────────────────────────────────
export function useSprintItems() {
  const [items, setItems] = useState(() => {
    const stored = load(KEYS.SPRINT_ITEMS, null)
    if (!stored) return DEFAULT_SPRINT_ITEMS
    // Merge defaults with stored so new items added by Claude appear automatically
    const storedMap = Object.fromEntries(stored.map(i => [i.id, i]))
    return DEFAULT_SPRINT_ITEMS.map(def => ({
      ...def,
      ...(storedMap[def.id] ?? {}),
    }))
  })

  useEffect(() => { save(KEYS.SPRINT_ITEMS, items) }, [items])

  const updateStatus = useCallback((id, status) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
  }, [])

  const updateNotes = useCallback((id, notes) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i))
  }, [])

  return { items, updateStatus, updateNotes }
}

// ── App Ideas ──────────────────────────────────────────────────────────────
export function useAppIdeas() {
  const [ideas, setIdeas] = useState(() => load(KEYS.APP_IDEAS, DEFAULT_APP_IDEAS))

  useEffect(() => { save(KEYS.APP_IDEAS, ideas) }, [ideas])

  const addIdea = useCallback((title, description) => {
    const idea = {
      id: `app-idea-${Date.now()}`,
      title,
      description,
      status: 'parked',
      notes: '',
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
