import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GlobalStatsBar } from './GlobalStatsBar'

describe('GlobalStatsBar', () => {
  it('shows count and avg', () => {
    render(<GlobalStatsBar count={42} avg={85} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<GlobalStatsBar count={null} avg={null} />)
    expect(screen.getAllByText('--')).toHaveLength(2)
  })
})
