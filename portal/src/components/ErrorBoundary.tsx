import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-[var(--radius)] p-6 flex flex-col items-center gap-3"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--status-error)',
          }}
        >
          <AlertTriangle size={32} style={{ color: 'var(--status-error)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {this.props.fallbackTitle || 'Something went wrong'}
          </h3>
          <p className="text-xs text-center max-w-md" style={{ color: 'var(--text-muted)' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer transition-colors duration-150"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
