import { CHECKLIST_STEPS } from '../../data/checklistData'

function stageOf(stepId) {
  const step = CHECKLIST_STEPS.find(s => s.id === stepId)
  return step?.stage ?? 'Stage 0 — Foundation'
}

export default function MissionControl({ currentStep, doneCount, totalCount, daysSince }) {
  const pct = Math.round((doneCount / totalCount) * 100)
  const stage = currentStep ? stageOf(currentStep.id) : 'Complete'

  return (
    <div className="bg-surface border border-border rounded-card p-5 mb-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-accent text-[10px] font-semibold tracking-widest uppercase">
          Today's Focus
        </span>
        <span className="text-[10px] bg-elevated text-muted px-2 py-0.5 rounded-full tracking-wide uppercase">
          {stage}
        </span>
        <div className="ml-auto flex gap-3">
          <div className="text-right">
            <div className="text-[9px] text-muted uppercase tracking-widest">MRR</div>
            <div className="text-text font-semibold text-sm">$0</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-muted uppercase tracking-widest">Days Since Milestone</div>
            <div className="text-text font-semibold text-sm">{daysSince}</div>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-text mb-4">
        {currentStep
          ? `Step ${currentStep.id} — ${currentStep.title}`
          : '🎉 All 21 steps complete!'
        }
      </h1>

      <div className="space-y-1">
        <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-muted uppercase tracking-widest">
            {doneCount}/{totalCount} Tasks Complete
          </span>
          <span className="text-[10px] text-muted">{pct}%</span>
        </div>
      </div>
    </div>
  )
}
