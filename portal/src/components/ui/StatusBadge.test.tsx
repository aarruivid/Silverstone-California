import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders default label for each status', () => {
    const statuses = ['ok', 'warning', 'error', 'pending', 'running'] as const
    const labels = ['OK', 'Warning', 'Error', 'Pending', 'Running']

    statuses.forEach((status, i) => {
      const { unmount } = render(<StatusBadge status={status} />)
      expect(screen.getByText(labels[i])).toBeInTheDocument()
      unmount()
    })
  })

  it('renders custom label when provided', () => {
    render(<StatusBadge status="ok" label="Healthy" />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('applies animate-pulse class only for running status', () => {
    const { container, unmount } = render(<StatusBadge status="running" />)
    const dot = container.querySelector('.animate-pulse')
    expect(dot).toBeInTheDocument()
    unmount()

    const { container: c2 } = render(<StatusBadge status="ok" />)
    const noPulse = c2.querySelector('.animate-pulse')
    expect(noPulse).toBeNull()
  })

  it('applies correct color for ok status', () => {
    const { container } = render(<StatusBadge status="ok" />)
    const badge = container.querySelector('span')
    expect(badge?.style.color).toBe('rgb(34, 197, 94)')
  })

  it('applies correct color for error status', () => {
    const { container } = render(<StatusBadge status="error" />)
    const badge = container.querySelector('span')
    expect(badge?.style.color).toBe('rgb(239, 68, 68)')
  })

  it('renders as inline-flex pill', () => {
    const { container } = render(<StatusBadge status="warning" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('inline-flex')
    expect(badge?.className).toContain('rounded-full')
  })
})
