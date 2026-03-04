import { useEffect, useState } from 'react'
import { getApi } from '../../lib/api'
import { DataTable, StatusBadge, CardSkeleton } from '../../components/ui'
import type { Column } from '../../components/ui/DataTable'
import type { PerformanceData } from '../../types/mission-control'
import type { Status } from '../../components/ui/StatusBadge'

const riskStatusMap: Record<string, Status> = {
  healthy: 'ok',
  'at-risk': 'warning',
  critical: 'error',
}

const columns: Column<PerformanceData>[] = [
  { key: 'name', header: 'Scraper' },
  { key: 'type', header: 'Type' },
  {
    key: 'risk',
    header: 'Risk',
    render: (row: PerformanceData) => (
      <StatusBadge
        status={riskStatusMap[row.risk] ?? 'pending'}
        label={row.risk}
      />
    ),
  },
  {
    key: 'zero_streak',
    header: 'Zero Streak',
    align: 'right',
    mono: true,
    render: (row: PerformanceData) => (
      <span style={{ color: row.zero_streak > 2 ? 'var(--status-error)' : 'var(--text)' }}>
        {row.zero_streak}
      </span>
    ),
  },
  {
    key: 'last_reviewed',
    header: 'Last Reviewed',
    render: (row: PerformanceData) => (
      <span style={{ color: row.last_reviewed ? 'var(--text)' : 'var(--text-muted)' }}>
        {row.last_reviewed ?? 'Never'}
      </span>
    ),
  },
]

export default function ScrapersTab() {
  const [data, setData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const api = getApi()
    api.get<PerformanceData[]>('/mission-control/performance')
      .then(d => setData(Array.isArray(d) ? d : []))
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
        Failed to load scraper data: {error}
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      keyField="name"
      emptyMessage="No scraper performance data available"
    />
  )
}
