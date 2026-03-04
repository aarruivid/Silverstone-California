import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Activity } from 'lucide-react'
import StatCard from './StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Users" value={1234} icon={Activity} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('renders string value', () => {
    render(<StatCard label="Status" value="Online" icon={Activity} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<StatCard label="CPU" value="42%" icon={Activity} subtitle="+3% from last hour" />)
    expect(screen.getByText('+3% from last hour')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const { container } = render(<StatCard label="CPU" value="42%" icon={Activity} />)
    // Only label, value — no subtitle element
    const texts = container.querySelectorAll('.text-xs.mt-1')
    expect(texts.length).toBe(0)
  })

  it('applies mono font to value', () => {
    render(<StatCard label="Ping" value="12ms" icon={Activity} />)
    const valueEl = screen.getByText('12ms')
    expect(valueEl.className).toContain('font-mono')
  })

  it('applies accent color to value', () => {
    render(<StatCard label="Errors" value={5} icon={Activity} accent="red" />)
    const valueEl = screen.getByText('5')
    expect(valueEl.style.color).toBe('var(--status-error)')
  })

  it('defaults accent to var(--accent)', () => {
    render(<StatCard label="Score" value={99} icon={Activity} />)
    const valueEl = screen.getByText('99')
    expect(valueEl.style.color).toBe('var(--accent)')
  })
})
