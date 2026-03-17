import ReactApexChart from 'react-apexcharts'
import { Users, DollarSign, TrendingUp, CheckCircle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { StatCard, ChartCard } from '../components/ui'

const DHL_YELLOW = '#FFCC00'

// --- Static Data ---
const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
const SIGNED   = [6, 8, 12, 14, 10, 7, 9]       // total = 66
const CANCELLED = [2, 2, 4, 4, 3, 1, 2]          // total = 18 → 27.3%
const INSTALLED = [3, 5, 7, 9, 6, 4, 4]           // total = 38

const REPS = [
  { name: 'Tristan', deals: 15, commission: 76_430 },
  { name: 'Eric',    deals: 12, commission: 59_815 },
  { name: 'Samuel',  deals: 7,  commission: 34_720 },
  { name: 'Trevor',  deals: 4,  commission: 20_435 },
]

const COMMISSION_RANGES = [
  { range: '$3K–$4K',  count: 8 },
  { range: '$4K–$5K',  count: 12 },
  { range: '$5K–$6K',  count: 11 },
  { range: '$6K–$7K',  count: 5 },
  { range: '$7K+',     count: 2 },
]

const SHOWUP_MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
const SHOWUP_RATES  = [38, 43, 51, 58, 65, 70, 74]

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function TrioSolar() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const tooltipTheme = isDark ? 'dark' : 'light'

  const baseChart: Partial<ApexCharts.ApexOptions['chart']> = {
    background: 'transparent',
    foreColor: 'var(--text)',
    toolbar: { show: false },
  }

  // --- Chart Options ---

  const monthlyOpts: ApexCharts.ApexOptions = {
    chart: { ...baseChart, type: 'bar', stacked: true },
    colors: ['var(--status-ok)', 'var(--status-error)', 'var(--status-warn)'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    xaxis: { categories: MONTHS },
    yaxis: { title: { text: 'Deals' } },
    tooltip: { theme: tooltipTheme },
    legend: { labels: { colors: 'var(--text)' } },
    grid: { borderColor: 'var(--border)' },
  }

  const donutOpts: ApexCharts.ApexOptions = {
    chart: { ...baseChart, type: 'donut' },
    labels: ['Installed & Paid', 'Cancelled', 'In Pipeline'],
    colors: ['var(--status-ok)', 'var(--status-error)', 'var(--status-warn)'],
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: { show: true, label: 'Total Signed', fontSize: '13px', color: 'var(--text-secondary)' },
          },
        },
      },
    },
    legend: { position: 'bottom', labels: { colors: 'var(--text)' } },
    tooltip: { theme: tooltipTheme },
  }

  const repOpts: ApexCharts.ApexOptions = {
    chart: { ...baseChart, type: 'bar' },
    colors: ['var(--status-ok)'],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '55%' } },
    xaxis: { categories: REPS.map(r => r.name), title: { text: 'Deals Closed' } },
    yaxis: { labels: { style: { colors: 'var(--text)' } } },
    tooltip: {
      theme: tooltipTheme,
      y: { formatter: (v: number, opts: { dataPointIndex: number }) => `${v} deals — ${fmt(REPS[opts.dataPointIndex]?.commission ?? 0)}` },
    },
    grid: { borderColor: 'var(--border)' },
  }

  const commDistOpts: ApexCharts.ApexOptions = {
    chart: { ...baseChart, type: 'bar' },
    colors: ['var(--accent)'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
    xaxis: { categories: COMMISSION_RANGES.map(c => c.range) },
    yaxis: { title: { text: 'Deals' } },
    tooltip: { theme: tooltipTheme },
    grid: { borderColor: 'var(--border)' },
  }

  const showupOpts: ApexCharts.ApexOptions = {
    chart: { ...baseChart, type: 'line' },
    colors: [DHL_YELLOW],
    stroke: { width: 3, curve: 'smooth' },
    markers: { size: 5, colors: [DHL_YELLOW], strokeColors: isDark ? '#1a1a2e' : '#fff', strokeWidth: 2 },
    xaxis: { categories: SHOWUP_MONTHS },
    yaxis: { min: 30, max: 80, labels: { formatter: (v: number) => `${v}%` }, title: { text: 'Show-up Rate' } },
    tooltip: { theme: tooltipTheme, y: { formatter: (v: number) => `${v}%` } },
    grid: { borderColor: 'var(--border)' },
    annotations: {
      yaxis: [
        { y: 74, borderColor: DHL_YELLOW, strokeDashArray: 4, label: { text: 'Current: 74%', style: { background: DHL_YELLOW, color: '#000', fontSize: '11px' } } },
      ],
    },
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Signed" value="66" icon={Users} accent="blue" subtitle="Aug 2025 – Feb 2026" />
        <StatCard label="Installed & Paid" value="38" icon={CheckCircle} accent="green" subtitle="79.2% install rate" />
        <StatCard label="Total Commission" value="$191,400" icon={DollarSign} accent="accent" subtitle="~$5,037/deal avg" />
        <StatCard label="Show-up Rate" value="74%" icon={TrendingUp} accent="yellow" subtitle="up from 38% in Aug" />
      </div>

      {/* Row 2: Monthly + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Deal Flow">
          <ReactApexChart
            options={monthlyOpts}
            series={[
              { name: 'Installed', data: INSTALLED },
              { name: 'Cancelled', data: CANCELLED },
              { name: 'Pipeline', data: SIGNED.map((s, i) => s - INSTALLED[i] - CANCELLED[i]) },
            ]}
            type="bar"
            height={320}
          />
        </ChartCard>

        <ChartCard title="Deal Outcomes">
          <ReactApexChart
            options={donutOpts}
            series={[38, 18, 10]}
            type="donut"
            height={320}
          />
        </ChartCard>
      </div>

      {/* Row 3: Rep Performance + Commission Dist + Show-up */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Rep Performance">
          <ReactApexChart
            options={repOpts}
            series={[{ name: 'Deals', data: REPS.map(r => r.deals) }]}
            type="bar"
            height={220}
          />
        </ChartCard>

        <ChartCard title="Commission Distribution">
          <ReactApexChart
            options={commDistOpts}
            series={[{ name: 'Deals', data: COMMISSION_RANGES.map(c => c.count) }]}
            type="bar"
            height={220}
          />
        </ChartCard>

        <ChartCard title="Show-up Rate Trend">
          <ReactApexChart
            options={showupOpts}
            series={[{ name: 'Show-up %', data: SHOWUP_RATES }]}
            type="line"
            height={220}
          />
        </ChartCard>
      </div>
    </div>
  )
}
