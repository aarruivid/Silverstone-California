import { useState, useEffect, useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import { DollarSign, TrendingUp, Percent, BarChart3 } from 'lucide-react'
import { getApi } from '../lib/api'
import { StatusBadge, DataTable, ChartCard, CardSkeleton, ChartSkeleton } from '../components/ui'
import type { Column } from '../components/ui'
import type { SolarData, Deal } from '../types/solar'

const TABS = ['Overview', 'Deals'] as const
type Tab = typeof TABS[number]

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Sparkline({ data, color = '#3b82f6', height = 32, width = 80 }: { data: number[]; color?: string; height?: number; width?: number }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="mt-2 opacity-60">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#spark-${color.replace('#', '')})`}
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  )
}

export function SolarOps() {
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

  const months = useMemo(() => Array.isArray(data?.by_month) ? data.by_month : [], [data])
  const reps = useMemo(() => Array.isArray(data?.by_rep) ? data.by_rep : [], [data])
  const paidByMonth = useMemo(() => months.map(m => m.paid), [months])
  const pendingByMonth = useMemo(() => months.map(m => m.pending), [months])
  const totalByMonth = useMemo(() => paidByMonth.map((p, i) => p + (pendingByMonth[i] ?? 0)), [paidByMonth, pendingByMonth])

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
    chart: { type: 'bar', stacked: true, background: 'transparent', foreColor: '#94a3b8', toolbar: { show: false } },
    colors: ['#3b82f6', '#f59e0b'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
    fill: {
      type: 'gradient',
      gradient: { shade: 'dark', type: 'vertical', opacityFrom: 0.9, opacityTo: 0.4, stops: [0, 100] },
    },
    xaxis: { categories: months.map(m => m.month) },
    yaxis: { labels: { formatter: (v: number) => fmt(v) } },
    tooltip: { theme: 'dark' },
    legend: { labels: { colors: '#94a3b8' } },
    grid: { borderColor: 'rgba(255,255,255,0.04)' },
  }

  const repChart: ApexCharts.ApexOptions = {
    chart: { type: 'bar', background: 'transparent', foreColor: '#94a3b8', toolbar: { show: false } },
    colors: ['#3b82f6', '#f59e0b'],
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '55%' } },
    fill: {
      type: 'gradient',
      gradient: { shade: 'dark', type: 'horizontal', opacityFrom: 0.9, opacityTo: 0.4, stops: [0, 100] },
    },
    xaxis: { labels: { formatter: (v: string) => fmt(Number(v)) } },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    tooltip: { theme: 'dark' },
    legend: { labels: { colors: '#94a3b8' } },
    grid: { borderColor: 'rgba(255,255,255,0.04)' },
  }

  return (
    <div className="solar-ops" style={{ background: '#09090b', minHeight: '100vh' }}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Solar Ops</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Solar income tracking and commission management
          </p>
        </div>

        {/* Tab Bar */}
        <div
          className="inline-flex gap-1 p-1 rounded-xl"
          style={{ background: '#111318', border: '1px solid rgba(59,130,246,0.08)' }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 ${tab === t ? 'solar-tab-active' : ''}`}
              style={{
                background: tab === t ? '#3b82f6' : 'transparent',
                color: tab === t ? '#ffffff' : '#64748b',
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
                <div className="solar-kpi rounded-xl p-5 transition-all duration-200" style={{ background: '#111318', border: '1px solid rgba(59,130,246,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Total Paid</span>
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.10)' }}>
                      <DollarSign size={16} style={{ color: '#22c55e' }} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono leading-tight" style={{ color: '#22c55e' }}>{fmt(data.total_paid)}</div>
                  <Sparkline data={paidByMonth} color="#22c55e" />
                </div>

                <div className="solar-kpi rounded-xl p-5 transition-all duration-200" style={{ background: '#111318', border: '1px solid rgba(59,130,246,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Total Pending</span>
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.10)' }}>
                      <TrendingUp size={16} style={{ color: '#f59e0b' }} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono leading-tight" style={{ color: '#f59e0b' }}>{fmt(data.total_pending)}</div>
                  <Sparkline data={pendingByMonth} color="#f59e0b" />
                </div>

                <div className="solar-kpi rounded-xl p-5 transition-all duration-200" style={{ background: '#111318', border: '1px solid rgba(59,130,246,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Collection Rate</span>
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.10)' }}>
                      <Percent size={16} style={{ color: '#3b82f6' }} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono leading-tight" style={{ color: '#3b82f6' }}>{(data.collection_rate * 100).toFixed(1)}%</div>
                </div>

                <div className="solar-kpi rounded-xl p-5 transition-all duration-200" style={{ background: '#111318', border: '1px solid rgba(59,130,246,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Avg Deal Value</span>
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.10)' }}>
                      <BarChart3 size={16} style={{ color: '#3b82f6' }} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold font-mono leading-tight" style={{ color: '#3b82f6' }}>{fmt(data.avg_deal_value)}</div>
                  <Sparkline data={totalByMonth} color="#3b82f6" />
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b' }}>Failed to load solar data.</p>
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
                      { name: 'Paid', data: paidByMonth },
                      { name: 'Pending', data: pendingByMonth },
                    ]}
                    type="bar"
                    height={320}
                  />
                </ChartCard>

                <ChartCard title="Rep Performance">
                  <ReactApexChart
                    options={{
                      ...repChart,
                      xaxis: { ...repChart.xaxis, categories: reps.map(r => r.rep) },
                    }}
                    series={[
                      { name: 'Paid', data: reps.map(r => r.paid) },
                      { name: 'Pending', data: reps.map(r => r.pending) },
                    ]}
                    type="bar"
                    height={Math.max(200, reps.length * 50)}
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
              className="solar-filter w-full max-w-md px-4 py-2 rounded-lg text-sm outline-none transition-all duration-150"
              style={{
                background: '#111318',
                border: '1px solid rgba(59,130,246,0.08)',
                color: '#e2e8f0',
              }}
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
      </div>
    </div>
  )
}
