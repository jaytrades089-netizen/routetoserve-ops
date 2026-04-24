import { useState, useCallback } from 'react'
import { LayoutDashboard, Smartphone } from 'lucide-react'
import Layout      from './components/layout/Layout'
import Dashboard   from './pages/Dashboard'
import AppTracker  from './components/app/AppTracker'
import ClaudePanel from './components/claude/ClaudePanel'
import {
  useChecklist,
  useIdeas,
  useDecisions,
  useMetrics,
  useMilestone,
} from './hooks/useStorage'
import { useSprintItems, useAppIdeas } from './hooks/useAppStorage'

// ── Workspace tab definitions ───────────────────────────────────────────────
// To add a new workspace: drop a new entry here. That's it.
const WORKSPACES = [
  { id: 'business', label: 'Business',    icon: LayoutDashboard },
  { id: 'app',      label: 'ServeRoute App', icon: Smartphone   },
]

export default function App() {
  // ── Top-level workspace (tab bar) ───────────────────────────────────────
  const [activeWorkspace, setActiveWorkspace] = useState('business')

  // ── Business sub-page (sidebar nav) ────────────────────────────────────
  const [activePage, setActivePage] = useState('dashboard')

  // ── Business state ──────────────────────────────────────────────────────
  const checklist = useChecklist()
  const ideas     = useIdeas()
  const decisions = useDecisions()
  const metrics   = useMetrics()
  const milestone = useMilestone()

  // ── App workspace state ─────────────────────────────────────────────────
  const sprintItems = useSprintItems()
  const appIdeas    = useAppIdeas()

  // ── Claude panel ────────────────────────────────────────────────────────
  const [panel, setPanel] = useState(null)

  const openChecklist = useCallback((step) =>
    setPanel({ mode: 'checklist', context: { step } }), [])

  const openBlueprint = useCallback((idea) =>
    setPanel({ mode: 'blueprint', context: { idea } }), [])

  const openDecision = useCallback((decision) =>
    setPanel({ mode: 'decision', context: { decision } }), [])

  const closePanel = useCallback(() => setPanel(null), [])

  // ── Checklist status change ─────────────────────────────────────────────
  const handleStatusChange = useCallback((id, status) => {
    checklist.updateStatus(id, status)
    if (status === 'done') milestone.markMilestone()
  }, [checklist, milestone])

  const checklistWithMilestone = { ...checklist, updateStatus: handleStatusChange }

  // ── Claude panel element ────────────────────────────────────────────────
  const claudePanelEl = panel ? (
    <ClaudePanel
      mode={panel.mode}
      context={panel.context}
      onClose={closePanel}
    />
  ) : null

  // ── Workspace badge counts (shown on tabs) ──────────────────────────────
  const appDoneCount    = sprintItems.items.filter(i => i.status === 'done').length
  const appTotalCount   = sprintItems.items.length
  const appActiveCount  = sprintItems.items.filter(i => i.status === 'in-progress').length
  const bizDoneCount    = Object.values(checklist.statuses).filter(s => s.status === 'done').length

  const workspacesWithBadges = WORKSPACES.map(ws => {
    if (ws.id === 'business') return { ...ws, badge: `${bizDoneCount}/${checklist.totalCount}` }
    if (ws.id === 'app')      return { ...ws, badge: appActiveCount > 0 ? `${appActiveCount} active` : `${appDoneCount}/${appTotalCount}` }
    return ws
  })

  // ── Business sub-page renderer ──────────────────────────────────────────
  const renderBusinessPage = () => {
    switch (activePage) {
      case 'checklist':
        return (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-text">Business Checklist</h1>
            <Dashboard
              checklist={checklistWithMilestone}
              ideas={ideas}
              decisions={decisions}
              metrics={metrics}
              daysSince={milestone.daysSince}
              onTalkToClaudeStep={openChecklist}
              onBlueprintIdea={openBlueprint}
              onThinkDecision={openDecision}
            />
          </div>
        )
      case 'ideas':
        return (
          <div className="max-w-lg">
            <h1 className="text-xl font-bold text-text mb-5">Ideas Pipeline</h1>
            <div className="space-y-3">
              {ideas.ideas.map(idea => (
                <div key={idea.id} className="bg-surface border border-border rounded-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-text font-medium">{idea.title}</span>
                    <span className="text-[9px] text-warning border border-warning/20 bg-warning/10 px-1.5 py-0.5 rounded uppercase tracking-widest font-semibold">
                      {idea.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{idea.description}</p>
                  {idea.notes && (
                    <p className="text-xs text-muted mt-2 border-t border-border pt-2">{idea.notes}</p>
                  )}
                  <button
                    onClick={() => openBlueprint(idea)}
                    className="mt-3 text-xs text-accent hover:text-accent-dim transition-colors"
                  >
                    Blueprint with Claude →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      case 'decisions':
        return (
          <div>
            <h1 className="text-xl font-bold text-text mb-5">Decisions Log</h1>
            <Dashboard
              checklist={checklistWithMilestone}
              ideas={ideas}
              decisions={decisions}
              metrics={metrics}
              daysSince={milestone.daysSince}
              onTalkToClaudeStep={openChecklist}
              onBlueprintIdea={openBlueprint}
              onThinkDecision={openDecision}
            />
          </div>
        )
      case 'metrics':
        return (
          <div className="max-w-sm">
            <h1 className="text-xl font-bold text-text mb-5">Metrics</h1>
            <div className="grid grid-cols-2 gap-3">
              {metrics.metrics.map(m => (
                <div key={m.id} className="bg-surface border border-border rounded-card p-4">
                  <div className="text-[9px] text-muted uppercase tracking-widest mb-2">{m.label}</div>
                  <div className={`text-2xl font-bold ${m.id === 'net_runway' ? 'text-accent' : 'text-text'}`}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'dashboard':
      default:
        return (
          <Dashboard
            checklist={checklistWithMilestone}
            ideas={ideas}
            decisions={decisions}
            metrics={metrics}
            daysSince={milestone.daysSince}
            onTalkToClaudeStep={openChecklist}
            onBlueprintIdea={openBlueprint}
            onThinkDecision={openDecision}
          />
        )
    }
  }

  // ── Top-level workspace renderer ────────────────────────────────────────
  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'app':
        return (
          <AppTracker
            sprintItems={sprintItems}
            appIdeas={appIdeas}
          />
        )
      case 'business':
      default:
        return renderBusinessPage()
    }
  }

  return (
    <Layout
      activePage={activePage}
      onNav={setActivePage}
      activeWorkspace={activeWorkspace}
      onWorkspace={setActiveWorkspace}
      workspaces={workspacesWithBadges}
      claudePanel={claudePanelEl}
    >
      {renderWorkspace()}
    </Layout>
  )
}
