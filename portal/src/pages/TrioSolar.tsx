import ReactApexChart from 'react-apexcharts'
import { DollarSign, Users, TrendingUp, Zap } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { StatCard, ChartCard } from '../components/ui'

const YELLOW = '#FFCC00'

const REPS = ['Aaron', 'Carlos', 'Miguel', 'Sofia', 'Daniel']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const MONTHLY_REVENUE = [42000, 58000, 51000, 67000, 73000, 61000]
const MONTHLY_INSTALLS = [8, 11, 10, 13, 15, 12]

const REP_SALES = [185000, 142000, 128000, 97000, 68000]
const REP_INSTALLS = [18, 14, 12, 9, 7]

const PIPELINE = [
  { stage: 'Lead', count: 45 },
  { stage: 'Qualified', count: 28 },
  { stage: 'Proposal', count: 16 },
  { stage: 'Contract', count: 9 },
  { stage: 'Installed', count: 6 },
]

const SYSTEM_SIZES = [
  { range: '3-5 kW', count: 12 },
  { range: '5-8 kW', count: 23 },
  { range: '8-12 kW', count: 18 },
  { range: '12-15 kW', count: 8 },
  { range: '15+ kW', count: 4 },
]

export function TrioSolar() {
  const { theme } = useTheme()
  const tooltipTheme = theme === 'dark' ? 'dark' : 'light'

  const totalRevenue = MONTHLY_REVENUE.reduce((a, b) => a + b, 0)
  const totalInstalls = MONTHLY_INSTALLS.reduce((a, b) => a + b, 0)
  const avgDeal = Math.round(totalRevenue / totalInstalls)

  const chartBase: Partial<ApexCharts.ApexOptions> = {
    chart: { background: 'transparent', foreColor: 'var(--text)', toolbar: { show: false } },
    tooltip: { theme: tooltipTheme },
    grid: { borderColor: 'var(--border)' },
  }

  const revenueChart: ApexCharts.ApexOptions = {
    ...chartBase,
    chart: { ...chartBase.chart, type: 'bar' },
    colors: [YELLOW],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    xaxis: { categories: MONTHS },
    yaxis: { labels: { formatter: (v: number) => `$${(v / 1000).toFixed(0)}k` } },
  }

  const installsChart: ApexCharts.ApexOptions = {
    ...chartBase,
    chart: { ...chartBase.chart, type: 'line' },
    colors: [YELLOW],
    stroke: { width: 3, curve: 'smooth' },
    markers: { size: 5, colors: [YELLOW], strokeColors: 'var(--bg-surface)', strokeWidth: 2 },
    xaxis: { categories: MONTHS },
    yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) } },
  }

  const repChart: ApexCharts.ApexOptions = {
    ...chartBase,
    chart: { ...chartBase.chart, type: 'bar' },
    colors: [YELLOW, 'var(--status-info)'],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '55%' } },
    xaxis: { labels: { formatter: (v: string) => `$${(Number(v) / 1000).toFixed(0)}k` } },
    yaxis: { labels: { style: { colors: 'var(--text)' } } },
    legend: { labels: { colors: 'var(--text)' } },
  }

  const pipelineChart: ApexCharts.ApexOptions = {
    ...chartBase,
    chart: { ...chartBase.chart, type: 'bar' },
    colors: [YELLOW],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%', distributed: true } },
    xaxis: { categories: PIPELINE.map(p => p.stage) },
    yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) } },
    legend: { show: false },
  }

  const sizeChart: ApexCharts.ApexOptions = {
    ...chartBase,
    chart: { ...chartBase.chart, type: 'donut' },
    colors: [YELLOW, '#FFD633', '#FFE066', '#FFEB99', '#FFF5CC'],
    labels: SYSTEM_SIZES.map(s => s.range),
    legend: { position: 'bottom', labels: { colors: 'var(--text)' } },
    dataLabels: { style: { colors: ['#000'] } },
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}k`} icon={DollarSign} accent="yellow" subtitle="YTD 2026" />
        <StatCard label="Installations" value={totalInstalls} icon={Zap} accent="green" subtitle={`${MONTHS.length} months`} />
        <StatCard label="Avg Deal Size" value={`$${(avgDeal / 1000).toFixed(1)}k`} icon={TrendingUp} accent="blue" />
        <StatCard label="Active Reps" value={REPS.length} icon={Users} accent="accent" />
      </div>

      {/* Revenue + Installs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Revenue">
          <ReactApexChart
            options={revenueChart}
            series={[{ name: 'Revenue', data: MONTHLY_REVENUE }]}
            type="bar"
            height={300}
          />
        </ChartCard>
        <ChartCard title="Monthly Installations">
          <ReactApexChart
            options={installsChart}
            series={[{ name: 'Installs', data: MONTHLY_INSTALLS }]}
            type="line"
            height={300}
          />
        </ChartCard>
      </div>

      {/* Rep Performance */}
      <ChartCard title="Rep Performance">
        <ReactApexChart
          options={{
            ...repChart,
            xaxis: { ...repChart.xaxis, categories: REPS },
          }}
          series={[
            { name: 'Revenue', data: REP_SALES },
            { name: 'Installs (x$10k)', data: REP_INSTALLS.map(i => i * 10000) },
          ]}
          type="bar"
          height={Math.max(200, REPS.length * 50)}
        />
      </ChartCard>

      {/* Pipeline + System Sizes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sales Pipeline">
          <ReactApexChart
            options={pipelineChart}
            series={[{ name: 'Deals', data: PIPELINE.map(p => p.count) }]}
            type="bar"
            height={280}
          />
        </ChartCard>
        <ChartCard title="System Sizes">
          <ReactApexChart
            options={sizeChart}
            series={SYSTEM_SIZES.map(s => s.count)}
            type="donut"
            height={280}
          />
        </ChartCard>
      </div>
    </div>
  )
}
