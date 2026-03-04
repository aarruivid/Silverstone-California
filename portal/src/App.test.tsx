import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the portal layout with MOLTBOT branding', () => {
    render(<App />)
    expect(screen.getByText('MOLTBOT')).toBeInTheDocument()
  })
})
