import {
  LayoutDashboard, CheckSquare, Lightbulb, Scale, BarChart2,
  Smartphone, ListTodo, Layers, Rocket,
} from 'lucide-react'

// ── Nav config per workspace ────────────────────────────────────────────────
// To add nav items to a new workspace: add an entry here keyed to the workspace id.
const WORKSPACE_NAV = {
  business: [
    { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
    { id: 'checklist',  label: 'Checklist',  Icon: CheckSquare },
    { id: 'ideas',      label: 'Ideas',      Icon: Lightbulb },
    { id: 'decisions',  label: 'Decisions',  Icon: Scale },
    { id: 'metrics',    label: 'Metrics',    Icon: BarChart2 },
  ],
  app: [
    { id: 'app-overview',  label: 'Overview',        Icon: Smartphone },
    { id: 'app-stability', label: 'Stability Sprint', Icon: ListTodo },
    { id: 'app-features',  label: 'Pinned Features',  Icon: Layers },
    { id: 'app-horizon',   label: 'On The Horizon',   Icon: Rocket },
    { id: 'app-ideas',     label: 'App Ideas',        Icon: Lightbulb },
  ],
}

export default function Sidebar({ active, onNav, activeWorkspace }) {
  const nav = WORKSPACE_NAV[activeWorkspace] ?? []

  // No nav items defined for this workspace — hide the sidebar
  if (!nav.length) return null

  return (
    <aside className="hidden md:flex flex-col w-[200px] min-h-screen bg-sidebar border-r border-border shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-white font-bold text-xs shrink-0">
            R
          </div>
          <div>
            <div className="text-text text-sm font-semibold leading-tight">RouteToServe Ops</div>
            <div className="text-muted text-[9px] tracking-widest uppercase">Internal Engine</div>
          </div>
        </div>
      </div>

      {/* Nav — same style for every workspace */}
      <nav className="flex-1 py-3">
        {nav.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150
              ${active === id
                ? 'text-text bg-elevated border-l-2 border-accent opacity-100'
                : 'text-muted hover:text-text hover:bg-surface border-l-2 border-transparent opacity-40 hover:opacity-70'
              }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* System status */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-muted text-[10px] tracking-widest uppercase">System Online</span>
        </div>
      </div>
    </aside>
  )
}
