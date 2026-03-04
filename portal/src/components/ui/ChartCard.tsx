import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  children: ReactNode
  action?: ReactNode
}

export default function ChartCard({ title, children, action }: ChartCardProps) {
  return (
    <div
      className="rounded-[var(--radius)] transition-all duration-150"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}
