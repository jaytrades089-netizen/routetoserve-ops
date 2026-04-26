import { Bell, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Header({ activeWorkspace, onWorkspace, workspaces }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  const formatDateTime = (date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const month = date.getMonth() + 1
    const day = date.getDate()
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase().replace(' ', '') // removes space before am/pm and makes it lowercase

    return `${dayName} ${month}/${day} ${timeString}`
  }

  return (
    <header className="shrink-0 border-b border-border bg-sidebar">
      {/* Top row — logo (mobile) + actions */}
      <div className="h-14 flex items-center justify-between px-5">
        {/* Mobile logo + Date/Time */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white font-bold text-xs">
            R
          </div>
          <span className="text-text text-sm font-semibold">RTS Ops</span>
          <span className="text-muted text-[10px] font-medium ml-1">
            {formatDateTime(currentTime)}
          </span>
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
      </div>

      {/* Workspace tab bar — full width, sits below the top row */}
      {workspaces && workspaces.length > 0 && (
        <div className="flex items-end gap-0 px-5 overflow-x-auto scrollbar-none">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace === ws.id
            return (
              <button
                key={ws.id}
                onClick={() => onWorkspace(ws.id)}
                className={`
                  relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium
                  whitespace-nowrap transition-all duration-150 border-b-2
                  ${isActive
                    ? 'text-text border-accent bg-elevated rounded-t-md'
                    : 'text-muted border-transparent hover:text-text hover:border-border'
                  }
                `}
              >
                {ws.icon && <ws.icon size={14} className={isActive ? 'text-accent' : 'text-muted'} />}
                {ws.label}
                {ws.badge != null && (
                  <span className={`
                    text-[9px] font-bold px-1.5 py-0.5 rounded-full
                    ${isActive ? 'bg-accent text-white' : 'bg-elevated text-muted'}
                  `}>
                    {ws.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}