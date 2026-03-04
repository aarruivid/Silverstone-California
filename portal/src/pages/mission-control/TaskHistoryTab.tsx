import { useEffect, useState } from 'react'
import { getApi } from '../../lib/api'
import { DataTable, StatusBadge, CardSkeleton } from '../../components/ui'
import type { Column } from '../../components/ui/DataTable'
import type { TaskRun } from '../../types/mission-control'

const columns: Column<TaskRun>[] = [
  { key: 'task_name', header: 'Task' },
  {
    key: 'success',
    header: 'Status',
    render: (row: TaskRun) => (
      <StatusBadge
        status={row.success ? 'ok' : 'error'}
        label={row.success ? 'Success' : 'Failed'}
      />
    ),
  },
  {
    key: 'duration_s',
    header: 'Duration',
    align: 'right',
    mono: true,
    render: (row: TaskRun) => `${row.duration_s.toFixed(1)}s`,
  },
  {
    key: 'started_at',
    header: 'Started',
    render: (row: TaskRun) => (
      <span className="font-mono text-xs">{row.started_at}</span>
    ),
  },
  {
    key: 'error',
    header: 'Error',
    render: (row: TaskRun) => (
      row.error ? (
        <span className="text-xs" style={{ color: 'var(--status-error)' }}>
          {row.error.length > 60 ? row.error.slice(0, 60) + '...' : row.error}
        </span>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>--</span>
      )
    ),
  },
]

export default function TaskHistoryTab() {
  const [data, setData] = useState<TaskRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const api = getApi()
    api.get<TaskRun[]>('/mission-control/runs')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-[var(--radius)] p-6 text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--status-error)' }}
      >
        Failed to load task history: {error}
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="task_id"
      emptyMessage="No task runs recorded"
    />
  )
}
