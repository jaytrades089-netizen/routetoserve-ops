import MissionControl    from '../components/dashboard/MissionControl'
import BusinessChecklist  from '../components/dashboard/BusinessChecklist'
import IdeasPipeline      from '../components/dashboard/IdeasPipeline'
import KeyMetrics         from '../components/dashboard/KeyMetrics'
import DecisionsLog       from '../components/dashboard/DecisionsLog'

export default function Dashboard({
  checklist,
  ideas,
  decisions,
  metrics,
  daysSince,
  onTalkToClaudeStep,
  onBlueprintIdea,
  onThinkDecision,
}) {
  return (
    <>
      <MissionControl
        currentStep={checklist.currentStep}
        doneCount={checklist.doneCount}
        totalCount={checklist.totalCount}
        daysSince={daysSince}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mb-5">
        <BusinessChecklist
          statuses={checklist.statuses}
          onStatusChange={checklist.updateStatus}
          onNotesChange={checklist.updateNotes}
          onTalkToClaude={onTalkToClaudeStep}
        />

        <div className="space-y-5">
          <IdeasPipeline
            ideas={ideas.ideas}
            onAddIdea={ideas.addIdea}
            onBlueprintIdea={onBlueprintIdea}
          />
          <KeyMetrics
            metrics={metrics.metrics}
            onUpdate={metrics.updateMetric}
          />
        </div>
      </div>

      <DecisionsLog
        decisions={decisions.decisions}
        onAdd={decisions.addDecision}
        onThinkWithClaude={onThinkDecision}
      />
    </>
  )
}
