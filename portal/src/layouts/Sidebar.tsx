import { useState, useEffect, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Monitor, DollarSign, Receipt, Dumbbell, Settings, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { checkHealth } from '../lib/api'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/mission-control', icon: Monitor, label: 'Mission Control' },
  { to: '/solar', icon: DollarSign, label: 'Solar Ops' },
  { to: '/isarv', icon: Receipt, label: 'ISARV Fiscal' },
  { to: '/fitness', icon: Dumbbell, label: 'Fitness' },
]

type ConnectionStatus = 'connected' | 'degraded' | 'offline'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggle } = useTheme()
  const [status, setStatus] = useState<ConnectionStatus>('offline')
  const w = collapsed ? 'w-[60px]' : 'w-[230px]'

  const pollHealth = useCallback(async () => {
    const health = await checkHealth()
    if (!health) {
      setStatus('offline')
      return
    }
    const services = Object.values(health.services)
    const allOk = services.every(s => s === 'ok')
    setStatus(allOk ? 'connected' : 'degraded')
  }, [])

  useEffect(() => {
    pollHealth()
    const interval = setInterval(pollHealth, 30_000)
    return () => clearInterval(interval)
  }, [pollHealth])

  const statusColor = {
    connected: 'var(--status-ok)',
    degraded: 'var(--status-warn)',
    offline: 'var(--status-error)',
  }[status]

  const statusLabel = {
    connected: 'Mac mini connected',
    degraded: 'Partially connected',
    offline: 'Mac mini offline',
  }[status]

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${w} bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col z-50 transition-all duration-200`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--border)]">
        <span className="text-lg font-bold tracking-tight text-[var(--accent)]">
          {collapsed ? 'M' : 'MOLTBOT'}
        </span>
        {!collapsed && <span className="text-xs text-[var(--text-muted)] ml-2 mt-0.5">Portal</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text)]'
              }` + (collapsed ? ' justify-center' : '')
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Settings link */}
      <div className="px-2 pb-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${
              isActive
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] font-medium'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text)]'
            }` + (collapsed ? ' justify-center' : '')
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} />
          {!collapsed && 'Settings'}
        </NavLink>
      </div>

      {/* Bottom controls */}
      <div className="p-3 border-t border-[var(--border)] space-y-2">
        {/* Status indicator */}
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : 'px-1'}`}>
          <div
            className={`w-2 h-2 rounded-full ${status === 'connected' ? 'animate-pulse' : ''}`}
            style={{ background: statusColor }}
          />
          {!collapsed && <span className="text-xs text-[var(--text-muted)]">{statusLabel}</span>}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] cursor-pointer transition-colors duration-150 w-full ${collapsed ? 'justify-center' : ''}`}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          {!collapsed && (theme === 'light' ? 'Dark mode' : 'Light mode')}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)] cursor-pointer transition-colors duration-150 w-full ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )
}
