type Status = 'ok' | 'warning' | 'error' | 'pending' | 'running'

interface StatusBadgeProps {
  status: Status
  label?: string
}

const statusConfig: Record<Status, { color: string; bg: string; text: string }> = {
  ok:      { color: 'var(--status-ok)',      bg: 'var(--status-ok-bg)',      text: 'OK' },
  warning: { color: 'var(--status-warn)',    bg: 'var(--status-warn-bg)',    text: 'Warning' },
  error:   { color: 'var(--status-error)',   bg: 'var(--status-error-bg)',   text: 'Error' },
  pending: { color: 'var(--status-pending)', bg: 'var(--status-pending-bg)', text: 'Pending' },
  running: { color: 'var(--status-info)',    bg: 'var(--status-info-bg)',    text: 'Running' },
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
