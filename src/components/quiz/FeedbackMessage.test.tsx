import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FeedbackMessage } from './FeedbackMessage'

describe('FeedbackMessage', () => {
  it('shows excellent for 100%', () => {
    render(<FeedbackMessage percentage={100} />)
    expect(screen.getByText(/滿分/)).toBeInTheDocument()
  })

  it('shows good for 80%', () => {
    render(<FeedbackMessage percentage={80} />)
    expect(screen.getByText(/不錯/)).toBeInTheDocument()
  })

  it('shows encouragement for 60%', () => {
    render(<FeedbackMessage percentage={60} />)
    expect(screen.getByText(/加油/)).toBeInTheDocument()
  })

  it('shows try harder for 30%', () => {
    render(<FeedbackMessage percentage={30} />)
    expect(screen.getByText(/再多練習/)).toBeInTheDocument()
  })
})
