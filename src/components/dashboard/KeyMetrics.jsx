import { useState } from 'react'
import { Pencil, Check } from 'lucide-react'

export default function KeyMetrics({ metrics, onUpdate }) {
  const [editing, setEditing]   = useState(null)
  const [draft, setDraft]       = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const startEdit = (m) => { setEditing(m.id); setDraft(m.value) }

  const saveEdit = async () => {
    if (!editing || isSaving) return
    setIsSaving(true)
    try { onUpdate(editing, draft.trim() || '0') } finally { setIsSaving(false) }
    setEditing(null)
  }

  return (
    <div className="bg-surface border border-border rounded-card p-5">
      <div className="text-[9px] text-muted uppercase tracking-widest mb-4">Key Metrics</div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div key={m.id} className="bg-elevated rounded-btn px-3 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted uppercase tracking-widest">{m.label}</span>
              <button
                onClick={() => editing === m.id ? saveEdit() : startEdit(m)}
                className="text-muted hover:text-accent transition-colors"
              >
                {editing === m.id ? <Check size={11} /> : <Pencil size={11} />}
              </button>
            </div>
            {editing === m.id ? (
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                className="w-full bg-highest border border-border rounded px-2 py-1 text-sm text-text focus:outline-none focus:border-accent/60"
              />
            ) : (
              <div className={`text-lg font-bold ${m.id === 'net_runway' ? 'text-accent' : 'text-text'}`}>
                {m.value}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
