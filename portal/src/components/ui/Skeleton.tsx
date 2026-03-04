interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-sm)] ${className}`}
      style={{ background: 'var(--bg-surface-3)' }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-[var(--radius)] p-5"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-5 rounded-md" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div
      className="rounded-[var(--radius)]"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <div className="p-5">
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}
