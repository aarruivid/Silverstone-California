import { useEffect, useRef } from 'react'

interface LogViewerProps {
  lines: string[]
  maxHeight?: string
  autoScroll?: boolean
}

function classifyLine(line: string): string | null {
  const lower = line.toLowerCase()
  if (lower.includes('error') || lower.includes('fatal') || lower.includes('exception')) return 'var(--status-error)'
  if (lower.includes('warn')) return 'var(--status-warn)'
  if (lower.includes('success') || lower.includes('ok') || lower.includes('done')) return 'var(--status-ok)'
  if (lower.includes('info')) return 'var(--status-info)'
  return null
}

export default function LogViewer({ lines, maxHeight = '400px', autoScroll = true }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines, autoScroll])

  const gutterWidth = String(lines.length).length

  return (
    <div
      ref={containerRef}
      className="rounded-[var(--radius)] overflow-auto font-mono"
      style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        maxHeight,
        fontSize: '12px',
        lineHeight: '1.6',
      }}
    >
      {lines.length === 0 ? (
        <div className="p-4" style={{ color: 'var(--text-muted)' }}>
          No log output
        </div>
      ) : (
        <table className="w-full">
          <tbody>
            {lines.map((line, i) => {
              const lineColor = classifyLine(line)
              return (
                <tr key={i} className="hover:bg-[var(--bg-surface-2)] transition-colors duration-150">
                  <td
                    className="select-none text-right px-3 py-0 align-top"
                    style={{
                      color: 'var(--text-muted)',
                      width: `${gutterWidth + 2}ch`,
                      userSelect: 'none',
                      opacity: 0.5,
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="px-2 py-0 whitespace-pre-wrap break-all"
                    style={{ color: lineColor ?? 'var(--text)' }}
                  >
                    {line}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
