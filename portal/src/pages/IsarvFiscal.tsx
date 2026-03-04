import { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts'
import { ArrowRightLeft, Wallet, Calendar, ShieldCheck, TrendingUp } from 'lucide-react'
import { getApi } from '../lib/api'
import { useTheme } from '../contexts/ThemeContext'
import { StatCard, StatusBadge, ChartCard, CardSkeleton, ChartSkeleton } from '../components/ui'
import type { IsarvOverview, Deadline, ComplianceCheck, CashflowEntry } from '../types/isarv'

const TABS = ['Overview', 'Deadlines', 'Compliance', 'Cashflow'] as const
type Tab = typeof TABS[number]

function brl(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function fmtCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

const deadlineColor: Record<Deadline['status'], string> = {
  overdue: 'var(--status-error)',
  today: 'var(--status-warn)',
  upcoming: 'var(--status-info)',
  ok: 'var(--status-ok)',
}

const deadlineBadgeMap: Record<Deadline['status'], 'error' | 'warning' | 'running' | 'ok'> = {
  overdue: 'error',
  today: 'warning',
  upcoming: 'running',
  ok: 'ok',
}

const complianceBadgeMap: Record<ComplianceCheck['status'], 'ok' | 'warning' | 'error'> = {
  ok: 'ok',
  warning: 'warning',
  critical: 'error',
}

export function IsarvFiscal() {
  const { theme } = useTheme()
  const [tab, setTab] = useState<Tab>('Overview')
  const [overview, setOverview] = useState<IsarvOverview | null>(null)
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [compliance, setCompliance] = useState<ComplianceCheck[]>([])
  const [cashflow, setCashflow] = useState<CashflowEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const api = getApi()
    Promise.all([
      api.get<IsarvOverview>('/isarv/overview'),
      api.get<Deadline[]>('/isarv/deadlines'),
      api.get<ComplianceCheck[]>('/isarv/compliance'),
      api.get<CashflowEntry[]>('/isarv/cashflow?view=monthly'),
    ])
      .then(([ov, dl, co, cf]) => {
        setOverview(ov && typeof ov === 'object' && !Array.isArray(ov) ? ov : null)
        setDeadlines(Array.isArray(dl) ? dl : [])
        setCompliance(Array.isArray(co) ? co : [])
        setCashflow(Array.isArray(cf) ? cf : [])
      })
      .catch(() => {
        setOverview(null)
        setDeadlines([])
        setCompliance([])
        setCashflow([])
      })
      .finally(() => setLoading(false))
  }, [])

  const cashflowChart: ApexCharts.ApexOptions = {
    chart: { type: 'bar', background: 'transparent', foreColor: 'var(--text)', toolbar: { show: false } },
    colors: ['var(--status-ok)', 'var(--status-error)', 'var(--status-info)'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '65%' } },
    xaxis: { categories: cashflow.map(c => c.month) },
    yaxis: { labels: { formatter: (v: number) => brl(v) } },
    tooltip: { theme: theme === 'dark' ? 'dark' : 'light' },
    legend: { labels: { colors: 'var(--text)' } },
    grid: { borderColor: 'var(--border)' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>ISARV Fiscal</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          MEI fiscal management — taxes, compliance, and cashflow
        </p>
      </div>

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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : overview ? (
            <>
              {/* PTAX + Wise */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="PTAX Rate"
                  value={overview.ptax.rate.toFixed(4)}
                  icon={ArrowRightLeft}
                  accent="blue"
                  subtitle={`Updated ${overview.ptax.date}`}
                />
                {overview.wise.balances.map((b) => (
                  <StatCard
                    key={b.currency}
                    label={`Wise ${b.currency}`}
                    value={fmtCurrency(b.amount, b.currency)}
                    icon={Wallet}
                    accent="green"
                  />
                ))}
              </div>

              {/* Projection */}
              <div
                className="rounded-[var(--radius)] p-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                  Monthly Projection
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Revenue', value: brl(overview.projection.revenue_brl), color: 'var(--status-ok)' },
                    { label: 'DAS', value: brl(overview.projection.das), color: 'var(--status-warn)' },
                    { label: 'INSS', value: brl(overview.projection.inss), color: 'var(--status-warn)' },
                    { label: 'Net', value: brl(overview.projection.net), color: 'var(--accent)' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {item.label}
                      </div>
                      <div className="text-lg font-bold font-mono" style={{ color: item.color }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines Preview */}
              <div
                className="rounded-[var(--radius)] p-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    Upcoming Deadlines
                  </h3>
                  <button
                    onClick={() => setTab('Deadlines')}
                    className="text-xs cursor-pointer"
                    style={{ color: 'var(--accent)' }}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-2">
                  {overview.deadlines.slice(0, 4).map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between py-2 px-3 rounded-[var(--radius-sm)]"
                      style={{ background: 'var(--bg-surface-2)' }}
                    >
                      <span className="text-sm" style={{ color: 'var(--text)' }}>{d.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{d.date}</span>
                        <StatusBadge status={deadlineBadgeMap[d.status]} label={d.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Failed to load ISARV data.</p>
          )}
        </div>
      )}

      {/* Deadlines Tab */}
      {tab === 'Deadlines' && (
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : deadlines.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No deadlines found.</p>
          ) : (
            deadlines.map((d) => (
              <div
                key={d.name}
                className="rounded-[var(--radius)] p-5 flex items-center justify-between"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${deadlineColor[d.status]}`,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} style={{ color: deadlineColor[d.status] }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{d.name}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {d.date} — {d.days_left > 0 ? `${d.days_left} days left` : d.days_left === 0 ? 'Today' : `${Math.abs(d.days_left)} days overdue`}
                  </span>
                </div>
                <StatusBadge status={deadlineBadgeMap[d.status]} label={d.status} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Compliance Tab */}
      {tab === 'Compliance' && (
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : compliance.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No compliance checks found.</p>
          ) : (
            compliance.map((c) => (
              <div
                key={c.check}
                className="rounded-[var(--radius)] p-5 flex items-center justify-between"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{c.check}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.detail}</div>
                  </div>
                </div>
                <StatusBadge status={complianceBadgeMap[c.status]} label={c.status} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Cashflow Tab */}
      {tab === 'Cashflow' && (
        <div>
          {loading ? (
            <ChartSkeleton />
          ) : cashflow.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No cashflow data available.</p>
          ) : (
            <ChartCard title="Monthly Cashflow" action={
              <div className="flex items-center gap-1">
                <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>BRL</span>
              </div>
            }>
              <ReactApexChart
                options={cashflowChart}
                series={[
                  { name: 'Income', data: cashflow.map(c => c.income) },
                  { name: 'Expenses', data: cashflow.map(c => c.expenses) },
                  { name: 'Net', data: cashflow.map(c => c.net) },
                ]}
                type="bar"
                height={360}
              />
            </ChartCard>
          )}
        </div>
      )}
    </div>
  )
}
