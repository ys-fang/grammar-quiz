import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('shows current / total', () => {
    render(<ProgressBar current={3} total={10} />)
    expect(screen.getByText('3 / 10')).toBeInTheDocument()
  })

  it('renders a progress bar with correct width', () => {
    render(<ProgressBar current={5} total={10} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '5')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
  })
})
