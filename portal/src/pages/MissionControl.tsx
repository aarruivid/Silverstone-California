import { useState, useEffect } from 'react'
import { getApi } from '../lib/api'
import type { DashboardData } from '../types/mission-control'
import OverviewTab from './mission-control/OverviewTab'
import ScrapersTab from './mission-control/ScrapersTab'
import LogsTab from './mission-control/LogsTab'
import TaskHistoryTab from './mission-control/TaskHistoryTab'

const TABS = ['Overview', 'Scrapers', 'Logs', 'Task History'] as const
type Tab = typeof TABS[number]

export function MissionControl() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const api = getApi()
    api.get<DashboardData>('/mission-control/dashboard')
      .then(setDashboardData)
      .catch(() => setDashboardData(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text)' }}
        >
          Mission Control
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          MOLTBOT scraper orchestration and monitoring
        </p>
      </div>

      {/* Tab Bar */}
      <div
        className="flex gap-1 p-1 rounded-[var(--radius)]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-all duration-150"
            style={{
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <OverviewTab data={dashboardData} loading={loading} />
      )}
      {activeTab === 'Scrapers' && <ScrapersTab />}
      {activeTab === 'Logs' && <LogsTab />}
      {activeTab === 'Task History' && <TaskHistoryTab />}
    </div>
  )
}
