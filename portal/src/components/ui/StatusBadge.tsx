type Status = 'ok' | 'warning' | 'error' | 'pending' | 'running'

interface StatusBadgeProps {
  status: Status
  label?: string
}

const statusConfig: Record<Status, { color: string; bg: string; text: string }> = {
  ok:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  text: 'OK' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', text: 'Warning' },
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  text: 'Error' },
  pending: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', text: 'Pending' },
  running: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', text: 'Running' },
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  const displayLabel = label ?? config.text

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full${status === 'running' ? ' animate-pulse' : ''}`}
        style={{ backgroundColor: config.color }}
      />
      {displayLabel}
    </span>
  )
}

export type { Status, StatusBadgeProps }
