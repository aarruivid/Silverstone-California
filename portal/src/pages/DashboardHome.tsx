import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radar, Sun, Landmark, Dumbbell, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getApi } from '../lib/api'
import { StatusBadge, HealthRing, CardSkeleton } from '../components/ui'
import type { Status } from '../components/ui'

interface SystemCard {
  key: string
  name: string
  description: string
  path: string
  icon: LucideIcon
  endpoint: string
}

const SYSTEMS: SystemCard[] = [
  {
    key: 'mission-control',
    name: 'Mission Control',
    description: 'Scraper orchestration, task scheduling, and system monitoring',
    path: '/mission-control',
    icon: Radar,
    endpoint: '/mission-control/health',
  },
  {
    key: 'solar',
    name: 'Solar Ops',
    description: 'Solar income tracking, commissions, and rep performance',
    path: '/solar',
    icon: Sun,
    endpoint: '/solar/data',
  },
  {
    key: 'isarv',
    name: 'ISARV Fiscal',
    description: 'MEI fiscal management — taxes, compliance, and cashflow',
    path: '/isarv',
    icon: Landmark,
    endpoint: '/isarv/overview',
  },
  {
    key: 'fitness',
    name: 'Fitness',
    description: 'Nutricion, entrenamiento y seguimiento corporal',
    path: '/fitness',
    icon: Dumbbell,
    endpoint: `/fitness/summary/daily/${new Date().toISOString().slice(0, 10)}`,
  },
]

export function DashboardHome() {
  const navigate = useNavigate()
  const [statuses, setStatuses] = useState<Record<string, Status>>({})
  const [loading, setLoading] = useState(true)
  const [healthyCount, setHealthyCount] = useState(0)

  useEffect(() => {
    const api = getApi()
    const checks = SYSTEMS.map(async (sys) => {
      try {
        await api.get(sys.endpoint)
        return { key: sys.key, status: 'ok' as Status }
      } catch {
        return { key: sys.key, status: 'error' as Status }
      }
    })

    Promise.all(checks)
      .then((results) => {
        const map: Record<string, Status> = {}
        let ok = 0
        results.forEach((r) => {
          map[r.key] = r.status
          if (r.status === 'ok') ok++
        })
        setStatuses(map)
        setHealthyCount(ok)
      })
      .finally(() => setLoading(false))
  }, [])

  const healthScore = SYSTEMS.length > 0 ? Math.round((healthyCount / SYSTEMS.length) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          MOLTBOT Portal
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Sistema unificado de operaciones
        </p>
      </div>

      {/* Health Summary */}
      <div
        className="rounded-[var(--radius)] p-6 flex items-center gap-8"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {loading ? (
          <div className="flex items-center gap-8 w-full">
            <div className="animate-pulse rounded-full" style={{ width: 100, height: 100, background: 'var(--bg-surface-3)' }} />
            <div className="space-y-2 flex-1">
              <div className="animate-pulse rounded h-5 w-40" style={{ background: 'var(--bg-surface-3)' }} />
              <div className="animate-pulse rounded h-4 w-60" style={{ background: 'var(--bg-surface-3)' }} />
            </div>
          </div>
        ) : (
          <>
            <HealthRing score={healthScore} size={100} label="Health" />
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                Portal Health
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {healthyCount} of {SYSTEMS.length} systems operational
              </p>
            </div>
          </>
        )}
      </div>

      {/* System Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SYSTEMS.map((sys) => (
            <button
              key={sys.key}
              onClick={() => navigate(sys.path)}
              className="rounded-[var(--radius)] p-5 text-left cursor-pointer transition-all duration-150 group"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center"
                    style={{ background: 'var(--accent-dim)' }}
                  >
                    <sys.icon size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{sys.name}</h3>
                  </div>
                </div>
                <StatusBadge status={statuses[sys.key] ?? 'pending'} />
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                {sys.description}
              </p>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                <span>Open dashboard</span>
                <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
