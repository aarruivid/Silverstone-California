import { useEffect, useState } from 'react'
import { getApi } from '../../lib/api'
import { LogViewer } from '../../components/ui'

interface BridgeEvent {
  timestamp: string
  event: string
  detail?: string
}

const LOG_SOURCES = ['bridge-history', 'runs'] as const
type LogSource = typeof LOG_SOURCES[number]

const sourceLabels: Record<LogSource, string> = {
  'bridge-history': 'Bridge Events',
  'runs': 'Task Runs',
}

export default function LogsTab() {
  const [source, setSource] = useState<LogSource>('bridge-history')
  const [lines, setLines] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const api = getApi()

    if (source === 'bridge-history') {
      api.get<BridgeEvent[]>('/mission-control/bridge-history')
        .then((events) => {
          const arr = Array.isArray(events) ? events : []
          setLines(arr.map((e) => `[${e.timestamp}] ${e.event}${e.detail ? ' — ' + e.detail : ''}`))
        })
        .catch((err) => setLines([`ERROR: ${err.message}`]))
        .finally(() => setLoading(false))
    } else {
      api.get<{ task_name: string; started_at: string; success: boolean; error: string | null }[]>('/mission-control/runs')
        .then((runs) => {
          const arr = Array.isArray(runs) ? runs : []
          setLines(arr.map((r) =>
            `[${r.started_at}] ${r.task_name} — ${r.success ? 'SUCCESS' : 'FAILED'}${r.error ? ': ' + r.error : ''}`
          ))
        })
        .catch((err) => setLines([`ERROR: ${err.message}`]))
        .finally(() => setLoading(false))
    }
  }, [source])

  return (
    <div className="space-y-4">
      {/* Source selector */}
      <div className="flex gap-2">
        {LOG_SOURCES.map((s) => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className="px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer transition-all duration-150"
            style={{
              background: source === s ? 'var(--accent)' : 'var(--bg-surface)',
              color: source === s ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              border: `1px solid ${source === s ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {sourceLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="rounded-[var(--radius)] p-12 text-center text-sm"
          style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          Loading logs...
        </div>
      ) : (
        <LogViewer lines={lines} maxHeight="520px" />
      )}
    </div>
  )
}
