import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import { Activity, Server, AlertTriangle, Clock } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { StatCard, StatusBadge, DataTable, HealthRing, ChartCard, CardSkeleton, ChartSkeleton } from '../../components/ui'
import type { Column } from '../../components/ui/DataTable'
import type { DashboardData, BatchScraper } from '../../types/mission-control'
import type { Status } from '../../components/ui/StatusBadge'

interface OverviewTabProps {
  data: DashboardData | null
  loading: boolean
}

const scraperStatusMap: Record<string, Status> = {
  success: 'ok',
  error: 'error',
  no_permits: 'warning',
  unknown: 'pending',
}

const batchColumns: Column<BatchScraper>[] = [
  { key: 'scraper', header: 'Scraper' },
  {
    key: 'status',
    header: 'Status',
    render: (row: BatchScraper) => (
      <StatusBadge
        status={scraperStatusMap[row.status] ?? 'pending'}
        label={row.status.replace('_', ' ')}
      />
    ),
  },
  { key: 'permits', header: 'Permits', align: 'right', mono: true },
  {
    key: 'size_kb',
    header: 'Size',
    align: 'right',
    mono: true,
    render: (row: BatchScraper) => `${row.size_kb} KB`,
  },
]

export default function OverviewTab({ data, loading }: OverviewTabProps) {
  const { theme } = useTheme()

  const failedToday = useMemo(() => {
    if (!data || !Array.isArray(data.latest_batch)) return 0
    return data.latest_batch.filter((s) => s.status === 'error').length
  }, [data])

  const uptimePercent = useMemo(() => {
    if (!data || !Array.isArray(data.recent_runs) || data.recent_runs.length === 0) return 100
    const successes = data.recent_runs.filter((r) => r.success).length
    return Math.round((successes / data.recent_runs.length) * 100)
  }, [data])

  const chartOptions = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: 'bar',
      background: 'transparent',
      foreColor: 'var(--text)',
      toolbar: { show: false },
    },
    theme: { mode: theme },
    plotOptions: {
      bar: { horizontal: true, barHeight: '60%', borderRadius: 4 },
    },
    colors: ['var(--status-ok)', 'var(--status-error)'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data?.recent_runs.slice(0, 10).map((r) => r.task_name) ?? [],
      labels: { style: { colors: 'var(--text-secondary)' } },
    },
    yaxis: {
      labels: { style: { colors: 'var(--text-secondary)' } },
    },
    grid: {
      borderColor: 'var(--border)',
      strokeDashArray: 4,
    },
    tooltip: {
      theme,
      y: { formatter: (val: number) => `${val.toFixed(1)}s` },
    },
    legend: { show: false },
  }), [data, theme])

  const chartSeries = useMemo(() => {
    if (!data) return []
    const runs = data.recent_runs.slice(0, 10)
    return [
      {
        name: 'Duration (s)',
        data: runs.map((r) => ({
          x: r.task_name,
          y: r.duration_s,
          fillColor: r.success ? 'var(--status-ok)' : 'var(--status-error)',
        })),
      },
    ]
  }, [data])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-[var(--radius)] p-5 flex items-center gap-4 transition-all duration-150"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <HealthRing score={data.health_score} size={72} />
          <div>
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Health Score
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Overall system health
            </div>
          </div>
        </div>

        <StatCard
          label="Active Scrapers"
          value={data.total_scrapers}
          icon={Server}
          accent="blue"
          subtitle={`Last batch: ${data.last_batch}`}
        />
        <StatCard
          label="Failed Today"
          value={failedToday}
          icon={AlertTriangle}
          accent={failedToday > 0 ? 'red' : 'green'}
          subtitle={failedToday === 0 ? 'All clear' : `${failedToday} scraper(s) failed`}
        />
        <StatCard
          label="Uptime"
          value={`${uptimePercent}%`}
          icon={Clock}
          accent={uptimePercent >= 90 ? 'green' : uptimePercent >= 70 ? 'yellow' : 'red'}
          subtitle={`${(data.recent_runs || []).length} recent runs`}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Batch Table */}
        <ChartCard
          title="Latest Batch"
          action={
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {data.last_batch}
            </span>
          }
        >
          <DataTable
            columns={batchColumns}
            data={data.latest_batch || []}
            keyField="file"
            emptyMessage="No scrapers in latest batch"
          />
        </ChartCard>

        {/* Run Timeline Chart */}
        <ChartCard title="Run Timeline">
          {(data.recent_runs || []).length > 0 ? (
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={Math.max(200, (data.recent_runs || []).slice(0, 10).length * 36)}
            />
          ) : (
            <div className="flex items-center justify-center h-48" style={{ color: 'var(--text-muted)' }}>
              <Activity size={20} className="mr-2" />
              No recent runs
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
