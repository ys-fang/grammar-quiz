import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { OptionButton } from './OptionButton'

describe('OptionButton', () => {
  it('renders option text', () => {
    render(<OptionButton label="A" index={0} onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveTextContent('A')
  })

  it('calls onClick with index when clicked', async () => {
    const onClick = vi.fn()
    render(<OptionButton label="B" index={1} onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(1)
  })

  it('shows correct state', () => {
    render(<OptionButton label="A" index={0} state="correct" onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'correct')
  })

  it('shows wrong state', () => {
    render(<OptionButton label="A" index={0} state="wrong" onClick={() => {}} />)
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'wrong')
  })

  it('is disabled when state is set', () => {
    render(<OptionButton label="A" index={0} state="disabled" onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
