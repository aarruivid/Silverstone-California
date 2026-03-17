import { useState, useEffect, useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import { DollarSign, TrendingUp, Percent, BarChart3 } from 'lucide-react'
import { getApi } from '../lib/api'
import { useTheme } from '../contexts/ThemeContext'
import { StatCard, StatusBadge, DataTable, ChartCard, CardSkeleton, ChartSkeleton } from '../components/ui'
import type { Column } from '../components/ui'
import type { SolarData, Deal } from '../types/solar'
import { TrioSolar } from './TrioSolar'

const SECTIONS = ['PERSONAL', 'TRIO SOLAR'] as const
type Section = typeof SECTIONS[number]

const TABS = ['Overview', 'Deals'] as const
type Tab = typeof TABS[number]

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function SolarOps() {
  const { theme } = useTheme()
  const [section, setSection] = useState<Section>('PERSONAL')
  const [tab, setTab] = useState<Tab>('Overview')
  const [data, setData] = useState<SolarData | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const api = getApi()
    Promise.all([
      api.get<SolarData>('/solar/data'),
      api.get<Deal[]>('/solar/deals'),
    ])
      .then(([d, dl]) => {
        setData(d && typeof d === 'object' && 'total_paid' in d ? d : null)
        setDeals(Array.isArray(dl) ? dl : [])
      })
      .catch(() => { setData(null); setDeals([]) })
      .finally(() => setLoading(false))
  }, [])

  const filteredDeals = useMemo(() => {
    if (!filter) return deals
    const q = filter.toLowerCase()
    return deals.filter(d =>
      d.customer.toLowerCase().includes(q) ||
      d.rep.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q)
    )
  }, [deals, filter])

  const dealColumns: Column<Deal>[] = [
    { key: 'month', header: 'Month' },
    { key: 'rep', header: 'Rep' },
    { key: 'customer', header: 'Customer' },
    { key: 'city', header: 'City' },
    {
      key: 'commission', header: 'Commission', align: 'right', mono: true,
      render: (row) => fmt(row.commission),
    },
    {
      key: 'status', header: 'Status', align: 'center',
      render: (row) => {
        const statusMap: Record<string, 'ok' | 'warning' | 'error' | 'pending'> = {
          paid: 'ok', pending: 'pending', dead: 'error', cancelled: 'error',
        }
        return <StatusBadge status={statusMap[row.status] ?? 'pending'} label={row.status} />
      },
    },
    { key: 'notes', header: 'Notes' },
  ]

  const monthlyChart: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, background: 'transparent', foreColor: 'var(--text)', toolbar: { show: false } },
    colors: ['var(--status-ok)', 'var(--status-warn)'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    xaxis: { categories: (data?.by_month ?? []).map(m => m.month) },
    yaxis: { labels: { formatter: (v: number) => fmt(v) } },
    tooltip: { theme: theme === 'dark' ? 'dark' : 'light' },
    legend: { labels: { colors: 'var(--text)' } },
    grid: { borderColor: 'var(--border)' },
  }

  const repChart: ApexCharts.ApexOptions = {
    chart: { type: 'bar', background: 'transparent', foreColor: 'var(--text)', toolbar: { show: false } },
    colors: ['var(--status-ok)', 'var(--status-warn)'],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
    xaxis: { labels: { formatter: (v: string) => fmt(Number(v)) } },
    yaxis: { labels: { style: { colors: 'var(--text)' } } },
    tooltip: { theme: theme === 'dark' ? 'dark' : 'light' },
    legend: { labels: { colors: 'var(--text)' } },
    grid: { borderColor: 'var(--border)' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Solar Ops</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Solar income tracking and commission management
          </p>
        </div>

        {/* Section Toggle */}
        <div
          className="flex gap-1 p-1 rounded-[var(--radius)]"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-150"
              style={{
                background: section === s ? 'var(--accent)' : 'transparent',
                color: section === s ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {section === 'TRIO SOLAR' ? <TrioSolar /> : <>

      {/* Tab Bar */}
      <div
        className="flex gap-1 p-1 rounded-[var(--radius)]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-all duration-150"
            style={{
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Paid" value={fmt(data.total_paid)} icon={DollarSign} accent="green" />
              <StatCard label="Total Pending" value={fmt(data.total_pending)} icon={TrendingUp} accent="yellow" />
              <StatCard label="Collection Rate" value={`${(data.collection_rate * 100).toFixed(1)}%`} icon={Percent} accent="blue" />
              <StatCard label="Avg Deal Value" value={fmt(data.avg_deal_value)} icon={BarChart3} accent="accent" />
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Failed to load solar data.</p>
          )}

          {/* Charts */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Monthly Revenue">
                <ReactApexChart
                  options={monthlyChart}
                  series={[
                    { name: 'Paid', data: (data.by_month || []).map(m => m.paid) },
                    { name: 'Pending', data: (data.by_month || []).map(m => m.pending) },
                  ]}
                  type="bar"
                  height={320}
                />
              </ChartCard>

              <ChartCard title="Rep Performance">
                <ReactApexChart
                  options={{
                    ...repChart,
                    xaxis: { ...repChart.xaxis, categories: (data.by_rep || []).map(r => r.rep) },
                  }}
                  series={[
                    { name: 'Paid', data: (data.by_rep || []).map(r => r.paid) },
                    { name: 'Pending', data: (data.by_rep || []).map(r => r.pending) },
                  ]}
                  type="bar"
                  height={Math.max(200, (data.by_rep || []).length * 50)}
                />
              </ChartCard>
            </div>
          ) : null}
        </div>
      )}

      {/* Deals Tab */}
      {tab === 'Deals' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Filter by customer, rep, status, city..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-[var(--radius-sm)] text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          {loading ? (
            <ChartSkeleton />
          ) : (
            <DataTable
              columns={dealColumns}
              data={filteredDeals}
              keyField="customer"
              emptyMessage="No deals found"
            />
          )}
        </div>
      )}
      </>}
    </div>
  )
}
