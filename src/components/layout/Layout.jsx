import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ activePage, onNav, activeWorkspace, onWorkspace, workspaces, claudePanel, children }) {
  const panelOpen = !!claudePanel

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar active={activePage} onNav={onNav} activeWorkspace={activeWorkspace} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          activeWorkspace={activeWorkspace}
          onWorkspace={onWorkspace}
          workspaces={workspaces}
        />

        {/* Content + Claude panel */}
        <div className="flex flex-1 overflow-hidden">
          <main
            className="flex-1 overflow-y-auto p-5 transition-all duration-300"
            style={{ minWidth: 0 }}
          >
            {children}
          </main>

          {/* Desktop slide-in panel */}
          {panelOpen && (
            <div className="hidden md:flex slide-in-right w-[420px] shrink-0 border-l border-border bg-surface flex-col">
              {claudePanel}
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {panelOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative slide-up bg-surface rounded-t-[16px] h-[85vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            {claudePanel}
          </div>
        </div>
      )}
    </div>
  )
}
