export interface DashboardData {
  health_score: number
  total_scrapers: number
  last_batch: string
  openclaw_status: string
  latest_batch: BatchScraper[]
  recent_runs: TaskRun[]
}

export interface TaskRun {
  task_id: string
  task_name: string
  started_at: string
  finished_at: string
  duration_s: number
  success: boolean
  error: string | null
}

export interface BatchScraper {
  file: string
  scraper: string
  status: 'success' | 'error' | 'no_permits' | 'unknown'
  permits: number
  size_kb: number
}

export interface PerformanceData {
  name: string
  type: string
  risk: 'critical' | 'at-risk' | 'healthy'
  zero_streak: number
  history: number[]
  last_reviewed: string | null
}
