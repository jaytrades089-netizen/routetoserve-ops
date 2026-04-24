import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, X, Lightbulb, Smartphone, AlertTriangle, FileCode, Lock } from 'lucide-react'
import {
  SPRINT_STAGES,
  PRIORITY_STYLE,
  STATUS_STYLE,
  STATUS_LABEL,
  STATUS_OPTIONS,
} from '../../data/appData'

// ── Priority badge ─────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  return (
    <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.medium}`}>
      {priority}
    </span>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${STATUS_STYLE[status] ?? STATUS_STYLE.todo}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

// ── Single sprint item row ─────────────────────────────────────────────────
function SprintItemRow({ item, onStatusChange, onNotesChange }) {
  const [expanded, setExpanded] = useState(false)

  const isBlocked   = item.status === 'blocked'
  const needsSpec   = item.status === 'needs-spec'
  const showCallout = (isBlocked || needsSpec) && item.blockedBy

  return (
    <div className={`rounded-btn border transition-colors ${
      item.status === 'done'
        ? 'border-border bg-surface opacity-50'
        : isBlocked
          ? 'border-red-500/30 bg-surface'
          : needsSpec
            ? 'border-warning/30 bg-surface'
            : 'border-border bg-surface hover:bg-elevated'
    }`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className={`text-sm font-medium truncate ${item.status === 'done' ? 'text-muted line-through' : 'text-text'}`}>
            {item.title}
          </span>
          <PriorityBadge priority={item.priority} />
        </div>
        <StatusBadge status={item.status} />
        {expanded
          ? <ChevronDown size={14} className="text-muted shrink-0" />
          : <ChevronRight size={14} className="text-muted shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] text-muted uppercase tracking-widest mb-1.5">What</div>
              <div className="text-xs text-text leading-relaxed">{item.what}</div>
            </div>
            <div>
              <div className="text-[9px] text-muted uppercase tracking-widest mb-1.5">Why</div>
              <div className="text-xs text-text leading-relaxed">{item.why}</div>
            </div>
          </div>

          {item.file && (
            <div className="flex gap-2 bg-elevated border border-border rounded-btn px-3 py-2.5">
              <FileCode size={13} className="text-muted shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-0.5">File / Location</div>
                <div className="text-xs text-text leading-relaxed font-mono">{item.file}</div>
              </div>
            </div>
          )}

          {showCallout && (
            <div className={`flex gap-2 rounded-btn px-3 py-2.5 border ${
              isBlocked ? 'bg-red-500/10 border-red-500/20' : 'bg-warning/10 border-warning/20'
            }`}>
              <AlertTriangle size={13} className={`shrink-0 mt-0.5 ${isBlocked ? 'text-red-400' : 'text-warning'}`} />
              <div>
                <div className={`text-[9px] uppercase tracking-widest mb-0.5 font-semibold ${isBlocked ? 'text-red-400' : 'text-warning'}`}>
                  {isBlocked ? 'Blocked By' : 'Needs Spec — Open Decisions'}
                </div>
                <div className="text-xs text-text leading-relaxed">{item.blockedBy}</div>
              </div>
            </div>
          )}

          {item.notes && (
            <div className="flex gap-2 bg-highest border border-border rounded-btn px-3 py-2.5">
              <Lock size={13} className="text-muted shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-0.5">Spec Notes</div>
                <div className="text-xs text-text leading-relaxed">{item.notes}</div>
              </div>
            </div>
          )}

          <div>
            <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Status</div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onStatusChange(item.id, opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-btn border transition-colors ${
                    item.status === opt.value
                      ? 'bg-accent border-accent text-white'
                      : 'bg-elevated border-border text-muted hover:text-text hover:border-accent/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Session Notes</div>
            <textarea
              value={item.notes}
              onChange={e => onNotesChange(item.id, e.target.value)}
              placeholder="Add notes from this session..."
              rows={2}
              className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60 transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── App ideas panel ────────────────────────────────────────────────────────
const IDEA_STATUS_STYLE = {
  parked: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-accent/10 text-accent border-accent/20',
  done:   'bg-success/10 text-success border-success/20',
}

function AppIdeasPanel({ ideas, onAddIdea, standalone = false }) {
  const [open, setOpen]     = useState(false)
  const [title, setTitle]   = useState('')
  const [desc, setDesc]     = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => { setTitle(''); setDesc(''); setOpen(false) }

  const handleAdd = async () => {
    if (!title.trim() || saving) return
    setSaving(true)
    try { onAddIdea(title.trim(), desc.trim()) } finally { setSaving(false) }
    reset()
  }

  return (
    <div className={`bg-surface border border-border rounded-card p-5 ${standalone ? 'max-w-lg' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={16} className="text-muted" />
        <h2 className="text-text font-semibold">App Ideas</h2>
      </div>

      <div className="space-y-2 mb-4">
        {ideas.map(idea => (
          <div key={idea.id} className="bg-elevated border border-border rounded-btn px-3 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-text truncate">{idea.title}</span>
              <span className={`text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded border ${IDEA_STATUS_STYLE[idea.status] ?? IDEA_STATUS_STYLE.parked}`}>
                {idea.status}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">{idea.description}</p>
          </div>
        ))}
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-sm text-accent border border-accent/30 hover:border-accent/60 hover:bg-accent/5 rounded-btn py-2 transition-colors"
        >
          <Plus size={14} />
          Log App Idea
        </button>
      ) : (
        <div className="border border-border rounded-btn p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">New App Idea</span>
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
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="What is it? (one sentence)"
            rows={2}
            className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60"
          />
          <button
            onClick={handleAdd}
            disabled={!title.trim() || saving}
            className="w-full text-xs px-3 py-2 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors disabled:opacity-40"
          >
            Log It
          </button>
        </div>
      )}
    </div>
  )
}

// ── Stage section ──────────────────────────────────────────────────────────
function StageSection({ stage, items, sprintItems }) {
  if (!items.length) return (
    <div className="text-sm text-muted text-center py-8">No items in this stage yet.</div>
  )
  return (
    <div className="space-y-2">
      {items.map(item => (
        <SprintItemRow
          key={item.id}
          item={item}
          onStatusChange={sprintItems.updateStatus}
          onNotesChange={sprintItems.updateNotes}
        />
      ))}
    </div>
  )
}

// ── Main AppTracker ────────────────────────────────────────────────────────
// stageFilter: null = overview (all stages), 'ideas-only' = ideas panel only,
//              or a stage name string = show only that stage
export default function AppTracker({ sprintItems, appIdeas, stageFilter = null }) {
  const doneCount  = sprintItems.items.filter(i => i.status === 'done').length
  const totalCount = sprintItems.items.length
  const nextItem   = sprintItems.items.find(i => i.status !== 'done' && i.stage === 'Stability Sprint')

  // ── Ideas-only view ──────────────────────────────────────────────────────
  if (stageFilter === 'ideas-only') {
    return (
      <div className="space-y-5">
        <AppIdeasPanel ideas={appIdeas.ideas} onAddIdea={appIdeas.addIdea} standalone />
      </div>
    )
  }

  // ── Single stage view ────────────────────────────────────────────────────
  if (stageFilter) {
    const stageItems = sprintItems.items.filter(i => i.stage === stageFilter)
    return (
      <div className="space-y-5">
        <div className="bg-surface border border-border rounded-card p-5">
          <h2 className="text-text font-semibold mb-1">{stageFilter}</h2>
          <p className="text-xs text-muted mb-4">
            {stageItems.filter(i => i.status === 'done').length}/{stageItems.length} done
          </p>
          <StageSection stage={stageFilter} items={stageItems} sprintItems={sprintItems} />
        </div>
      </div>
    )
  }

  // ── Overview (all stages + ideas sidebar) ────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header strip */}
      <div className="bg-surface border border-border rounded-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <Smartphone size={18} className="text-accent" />
          <div>
            <h1 className="text-text font-semibold">ServeRoute App</h1>
            <p className="text-[11px] text-muted">serveroute-v2 · Base44 · GitHub</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-bold text-text">{doneCount}/{totalCount}</div>
            <div className="text-[10px] text-muted uppercase tracking-widest">Items Done</div>
          </div>
        </div>
        {nextItem && (
          <div className="bg-elevated border border-accent/20 rounded-btn px-3 py-2">
            <div className="text-[9px] text-muted uppercase tracking-widest mb-0.5">Next Up — Stability Sprint</div>
            <div className="text-sm text-text font-medium">{nextItem.title}</div>
            <div className="text-xs text-muted mt-0.5">{nextItem.what.split('.')[0]}.</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div className="bg-surface border border-border rounded-card p-5 h-fit">
          <h2 className="text-text font-semibold mb-4">All Work</h2>
          <div className="space-y-6">
            {SPRINT_STAGES.map(stage => {
              const stageItems = sprintItems.items.filter(i => i.stage === stage)
              if (!stageItems.length) return null
              return (
                <div key={stage}>
                  <div className="text-[9px] text-muted uppercase tracking-widest mb-2 px-1">{stage}</div>
                  <div className="space-y-2">
                    {stageItems.map(item => (
                      <SprintItemRow
                        key={item.id}
                        item={item}
                        onStatusChange={sprintItems.updateStatus}
                        onNotesChange={sprintItems.updateNotes}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <AppIdeasPanel ideas={appIdeas.ideas} onAddIdea={appIdeas.addIdea} />
      </div>
    </div>
  )
}
