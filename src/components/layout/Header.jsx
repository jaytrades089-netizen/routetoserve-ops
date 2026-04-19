import { Bell, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-border bg-sidebar shrink-0">
      {/* Mobile logo (hidden on desktop — sidebar handles it) */}
      <div className="flex md:hidden items-center gap-2">
        <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white font-bold text-xs">
          R
        </div>
        <span className="text-text text-sm font-semibold">RTS Ops</span>
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="text-muted hover:text-text transition-colors">
          <Bell size={18} />
        </button>
        <button className="text-muted hover:text-text transition-colors">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
          JT
        </div>
      </div>
    </header>
  )
}
