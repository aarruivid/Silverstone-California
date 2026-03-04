import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: 'green' | 'blue' | 'yellow' | 'red' | 'accent'
  subtitle?: string
}

const accentColors: Record<string, string> = {
  green: 'var(--status-ok)',
  blue: 'var(--status-info)',
  yellow: 'var(--status-warn)',
  red: 'var(--status-error)',
  accent: 'var(--accent)',
}

export default function StatCard({ label, value, icon: Icon, accent = 'accent', subtitle }: StatCardProps) {
  const color = accentColors[accent] ?? 'var(--accent)'

  return (
    <div
      className="rounded-[var(--radius)] p-5 transition-all duration-150"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
        <Icon size={18} style={{ color: 'var(--text-muted)' }} />
      </div>

      <div
        className="text-2xl font-bold font-mono leading-tight"
        style={{ color }}
      >
        {value}
      </div>

      {subtitle && (
        <div
          className="text-xs mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}
