interface HealthRingProps {
  score: number
  size?: number
  label?: string
}

function getColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export default function HealthRing({ score, size = 120, label }: HealthRingProps) {
  const clamped = Math.max(0, Math.min(100, score))
  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const color = getColor(clamped)

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-surface-3)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 600ms ease, stroke 400ms ease' }}
        />
        {/* Center score */}
        <text
          x={size / 2}
          y={label ? size / 2 - 4 : size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-mono"
          style={{
            fill: color,
            fontSize: size * 0.28,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {clamped}
        </text>
        {/* Label below score */}
        {label && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.15}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fill: 'var(--text-muted)',
              fontSize: size * 0.1,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  )
}
