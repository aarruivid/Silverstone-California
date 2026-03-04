export interface SolarData {
  total_paid: number
  total_pending: number
  total_expected: number
  avg_monthly_paid: number
  dead_rate: number
  collection_rate: number
  avg_deal_value: number
  by_month: MonthData[]
  by_rep: RepData[]
  by_status: Record<string, number>
}

export interface MonthData {
  month: string
  paid: number
  pending: number
  expected: number
  at_risk: number
}

export interface RepData {
  rep: string
  paid: number
  pending: number
  count: number
}

export interface Deal {
  month: string
  rep: string
  customer: string
  city: string
  address: string
  commission: number
  status: string
  notes: string
}
