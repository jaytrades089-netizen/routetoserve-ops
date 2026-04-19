import { useState } from 'react'
import { ChevronRight, ChevronDown, ExternalLink, MessageCircle, CheckCircle2, Clock, Circle } from 'lucide-react'
import { CHECKLIST_STEPS, STAGES } from '../../data/checklistData'

function StatusDot({ status }) {
  if (status === 'done')        return <CheckCircle2 size={14} className="text-success shrink-0" />
  if (status === 'in_progress') return <Clock        size={14} className="text-warning shrink-0" />
  return <Circle size={14} className="text-muted shrink-0 opacity-40" />
}

function StepNumber({ id, status }) {
  const base = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0'
  if (status === 'done')        return <div className={`${base} bg-success/20 text-success`}>{id}</div>
  if (status === 'in_progress') return <div className={`${base} bg-warning/20 text-warning`}>{id}</div>
  return <div className={`${base} bg-elevated text-muted`}>{id}</div>
}

function StepRow({ step, stepState, isActive, isExpanded, onToggle, onStatusChange, onNotesChange, onTalkToClaude }) {
  const { status = 'todo', notes = '' } = stepState ?? {}

  const STATUS_OPTIONS = [
    { value: 'todo',        label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done',        label: 'Done' },
  ]

  return (
    <div className={`rounded-btn border transition-colors ${
      isActive && status !== 'done'
        ? 'border-accent/40 bg-elevated'
        : 'border-border bg-surface hover:bg-elevated'
    }`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={onToggle}
      >
        <StepNumber id={step.id} status={status} />
        <span className={`flex-1 text-sm font-medium ${status === 'done' ? 'text-muted line-through' : 'text-text'}`}>
          {step.title}
        </span>
        <StatusDot status={status} />
        {isExpanded
          ? <ChevronDown size={14} className="text-muted shrink-0" />
          : <ChevronRight size={14} className="text-muted shrink-0" />
        }
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'What', value: step.what },
              { label: 'Why',  value: step.why  },
              { label: 'Cost', value: step.cost },
              { label: 'Time', value: step.time },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[9px] text-muted uppercase tracking-widest mb-1">{label}</div>
                <div className="text-xs text-text">{value}</div>
              </div>
            ))}
          </div>

          {step.link && (
            <a
              href={step.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-dim transition-colors"
            >
              <ExternalLink size={12} />
              {step.linkLabel ?? step.link}
            </a>
          )}

          <div>
            <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Steps</div>
            <ol className="space-y-1.5">
              {step.steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-text">
                  <span className="text-muted shrink-0">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-highest border border-border rounded-btn px-3 py-2.5">
            <div className="text-[9px] text-muted uppercase tracking-widest mb-1">Done State</div>
            <div className="text-xs text-text">{step.doneState}</div>
          </div>

          <div>
            <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Status</div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onStatusChange(step.id, opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-btn border transition-colors ${
                    status === opt.value
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
            <div className="text-[9px] text-muted uppercase tracking-widest mb-2">Notes</div>
            <textarea
              value={notes}
              onChange={e => onNotesChange(step.id, e.target.value)}
              placeholder="Add notes..."
              rows={2}
              className="w-full bg-elevated border border-border rounded-btn px-3 py-2 text-sm text-text placeholder-muted resize-none focus:outline-none focus:border-accent/60 transition-colors"
            />
          </div>

          <button
            onClick={() => onTalkToClaude(step)}
            className="flex items-center gap-2 text-sm px-4 py-2 bg-accent hover:bg-accent-dim text-white rounded-btn transition-colors"
          >
            <MessageCircle size={14} />
            Talk to Claude about this step
          </button>
        </div>
      )}
    </div>
  )
}

export default function BusinessChecklist({ statuses, onStatusChange, onNotesChange, onTalkToClaude }) {
  const [expandedId, setExpandedId] = useState(null)
  const [expandAll, setExpandAll]   = useState(false)

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id)
  const activeStep = CHECKLIST_STEPS.find(s => statuses[s.id]?.status !== 'done')

  return (
    <div className="bg-surface border border-border rounded-card p-5 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text font-semibold">Business Checklist</h2>
        <button
          onClick={() => setExpandAll(p => !p)}
          className="text-xs text-accent hover:text-accent-dim transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-5">
        {STAGES.map(stage => {
          const steps = CHECKLIST_STEPS.filter(s => s.stage === stage)
          if (!steps.length) return null
          return (
            <div key={stage}>
              <div className="text-[9px] text-muted uppercase tracking-widest mb-2 px-1">
                {stage}
              </div>
              <div className="space-y-2">
                {steps.map(step => (
                  <StepRow
                    key={step.id}
                    step={step}
                    stepState={statuses[step.id]}
                    isActive={activeStep?.id === step.id}
                    isExpanded={expandAll || expandedId === step.id}
                    onToggle={() => toggle(step.id)}
                    onStatusChange={onStatusChange}
                    onNotesChange={onNotesChange}
                    onTalkToClaude={onTalkToClaude}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
