export interface IsarvOverview {
  ptax: { rate: number; date: string }
  wise: { balances: { currency: string; amount: number }[] }
  projection: { revenue_brl: number; das: number; inss: number; net: number }
  deadlines: Deadline[]
  compliance: ComplianceCheck[]
}

export interface Deadline {
  name: string
  date: string
  days_left: number
  status: 'overdue' | 'today' | 'upcoming' | 'ok'
}

export interface ComplianceCheck {
  check: string
  status: 'ok' | 'warning' | 'critical'
  detail: string
}

export interface CashflowEntry {
  month: string
  income: number
  expenses: number
  net: number
}
