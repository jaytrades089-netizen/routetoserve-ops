import { useState } from 'react'
import { Plus, X, Scale, MessageCircle } from 'lucide-react'

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DecisionsLog({ decisions, onAdd, onThinkWithClaude }) {
  const [open, setOpen]     = useState(false)
  const [form, setForm]     = useState({ title: '', context: '', decisionText: '', rationale: '' })
  const [isSaving, setIsSaving] = useState(false)

  const reset = () => { setForm({ title: '', context: '', decisionText: '', rationale: '' }); setOpen(false) }
  const field = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleLog = async () => {
    if (!form.title.trim() || !form.decisionText.trim() || isSaving) return
    setIsSaving(true)
    try { onAdd(form.title.trim(), form.context.trim(), form.decisionText.trim(), form.rationale.trim()) }
    finally { setIsSaving(false) }
    reset()
  }

  const handleThink = () => {
    if (!form.title.trim() || isSaving) return
    const d = { title: form.title.trim(), context: form.context.trim() }
    reset()
    onThinkWithClaude(d)
  }

  return (
    <div className="bg-surface border border-border rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-muted" />
          <h2 className="text-text font-semibold">Decisions Log</h2>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors"
        >
          <Plus size={12} />
          Add Decision
        </button>
      </div>

      {decisions.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm">
          No decisions logged yet. Every significant business decision should live here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="text-[9px] text-muted uppercase tracking-widest pb-2 pr-4 font-medium w-28">Date</th>
                <th className="text-[9px] text-muted uppercase tracking-widest pb-2 pr-4 font-medium w-56">Title</th>
                <th className="text-[9px] text-muted uppercase tracking-widest pb-2 font-medium">Summary</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map(d => (
                <tr key={d.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 text-muted text-xs align-top whitespace-nowrap">{fmt(d.decidedAt)}</td>
                  <td className="py-3 pr-4 text-text font-medium align-top">{d.title}</td>
                  <td className="py-3 text-muted text-xs align-top">{d.decisionText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={reset} />
          <div
            className="relative bg-surface border border-border rounded-card p-5 w-full max-w-lg space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-text font-semibold">Log a Decision</h3>
              <button onClick={reset} className="text-muted hover:text-text"><X size={16} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-muted uppercase tracking-widest block mb-1">Title *</label>
                <input
                  autoFocus
                  value={form.title}
                  onChange={e => field('title', e.target.value)}
                  placeholder="e.g. Chose Stripe over Paddle"
                  className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/60"
                />
              </div>
              <div>
                <label className="text-[9px] text-muted uppercase tracking-widest block mb-1">Context</label>
                <input
                  value={form.context}
                  onChange={e => field('context', e.target.value)}
                  placeholder="What situation led to this?"
                  className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/60"
                />
              </div>
              <div>
                <label className="text-[9px] text-muted uppercase tracking-widest block mb-1">Decision *</label>
                <textarea
                  value={form.decisionText}
                  onChange={e => field('decisionText', e.target.value)}
                  placeholder="What did you actually decide?"
                  rows={2}
                  className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60"
                />
              </div>
              <div>
                <label className="text-[9px] text-muted uppercase tracking-widest block mb-1">Rationale</label>
                <textarea
                  value={form.rationale}
                  onChange={e => field('rationale', e.target.value)}
                  placeholder="Why? (worth writing — you'll thank yourself later)"
                  rows={2}
                  className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleThink}
                disabled={!form.title.trim() || isSaving}
                className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2 bg-elevated border border-border hover:border-accent/40 text-text rounded-btn transition-colors disabled:opacity-40"
              >
                <MessageCircle size={14} />
                Think It Through with Claude
              </button>
              <button
                onClick={handleLog}
                disabled={!form.title.trim() || !form.decisionText.trim() || isSaving}
                className="flex-1 text-sm px-4 py-2 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors disabled:opacity-40"
              >
                Log It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
