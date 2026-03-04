import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  mono?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: string
  emptyMessage?: string
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data: rawData,
  keyField,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const data = Array.isArray(rawData) ? rawData : []
  const alignClass = (align?: string) => {
    if (align === 'right') return 'text-right'
    if (align === 'center') return 'text-center'
    return 'text-left'
  }

  return (
    <div
      className="rounded-[var(--radius)] overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold text-xs uppercase tracking-wider ${alignClass(col.align)}`}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={String(row[keyField])}
                  className="transition-colors duration-150"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${alignClass(col.align)} ${col.mono ? 'font-mono' : ''}`}
                      style={{ color: 'var(--text)' }}
                    >
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export type { Column, DataTableProps }
