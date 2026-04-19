import { useState } from 'react'
import { Plus, X, Lightbulb, MessageCircle } from 'lucide-react'

const STATUS_STYLE = {
  parked:   'bg-warning/10  text-warning  border-warning/20',
  active:   'bg-accent/10   text-accent   border-accent/20',
  done:     'bg-success/10  text-success  border-success/20',
  rejected: 'bg-red-500/10  text-red-400  border-red-500/20',
}

function IdeaCard({ idea, onBlueprint }) {
  return (
    <div className="flex items-start justify-between gap-3 bg-elevated border border-border rounded-btn px-3 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-text truncate">{idea.title}</span>
          <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${STATUS_STYLE[idea.status] ?? STATUS_STYLE.parked}`}>
            {idea.status}
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed">{idea.description}</p>
      </div>
      <button
        onClick={() => onBlueprint(idea)}
        title="Blueprint with Claude"
        className="text-muted hover:text-accent transition-colors shrink-0 mt-0.5"
      >
        <MessageCircle size={14} />
      </button>
    </div>
  )
}

export default function IdeasPipeline({ ideas, onAddIdea, onBlueprintIdea }) {
  const [open, setOpen]         = useState(false)
  const [title, setTitle]       = useState('')
  const [description, setDesc]  = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const reset = () => { setTitle(''); setDesc(''); setOpen(false) }

  const handleLog = async () => {
    if (!title.trim() || isSaving) return
    setIsSaving(true)
    try { onAddIdea(title.trim(), description.trim()) } finally { setIsSaving(false) }
    reset()
  }

  const handleBlueprint = () => {
    if (!title.trim() || isSaving) return
    setIsSaving(true)
    try {
      const idea = onAddIdea(title.trim(), description.trim())
      reset()
      onBlueprintIdea(idea)
    } finally { setIsSaving(false) }
  }

  return (
    <div className="bg-surface border border-border rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-muted" />
          <h2 className="text-text font-semibold">Ideas Pipeline</h2>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} onBlueprint={onBlueprintIdea} />
        ))}
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-sm text-accent border border-accent/30 hover:border-accent/60 hover:bg-accent/5 rounded-btn py-2 transition-colors"
        >
          <Plus size={14} />
          Add Idea
        </button>
      ) : (
        <div className="border border-border rounded-btn p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">New Idea</span>
            <button onClick={reset} className="text-muted hover:text-text"><X size={14} /></button>
          </div>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Idea name"
            className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/60"
          />
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="What is it? (one sentence)"
            rows={2}
            className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60"
          />
          <div className="flex gap-2">
            <button
              onClick={handleLog}
              disabled={!title.trim() || isSaving}
              className="flex-1 text-xs px-3 py-2 bg-elevated border border-border hover:border-accent/40 text-text rounded-btn transition-colors disabled:opacity-40"
            >
              Just Log It
            </button>
            <button
              onClick={handleBlueprint}
              disabled={!title.trim() || isSaving}
              className="flex-1 text-xs px-3 py-2 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <MessageCircle size={12} />
              Blueprint with Claude
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
