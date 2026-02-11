import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QuestionCard } from './QuestionCard'
import type { QuizQuestion } from '../../types/quiz'

const mockQ: QuizQuestion = {
  q: 'I saw a boy ______ the street.',
  options: ['crossing', 'crossed', 'to cross', 'crosses'],
  correctAnswer: 'crossing',
  correctIndex: 0,
  explanation: { translation: '翻譯', grammar: '文法' },
}

describe('QuestionCard', () => {
  it('renders question text', () => {
    render(
      <QuestionCard
        question={mockQ}
        onAnswer={() => {}}
        phase="question"
        selectedIndex={null}
      />
    )
    expect(screen.getByText(/I saw a boy/)).toBeInTheDocument()
  })

  it('renders all options', () => {
    render(
      <QuestionCard
        question={mockQ}
        onAnswer={() => {}}
        phase="question"
        selectedIndex={null}
      />
    )
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('calls onAnswer when option clicked', async () => {
    const onAnswer = vi.fn()
    render(
      <QuestionCard
        question={mockQ}
        onAnswer={onAnswer}
        phase="question"
        selectedIndex={null}
      />
    )
    await userEvent.click(screen.getByText('crossed'))
    expect(onAnswer).toHaveBeenCalledWith(1)
  })

  it('shows explanation in explanation phase', () => {
    render(
      <QuestionCard
        question={mockQ}
        onAnswer={() => {}}
        phase="explanation"
        selectedIndex={0}
      />
    )
    expect(screen.getByText('翻譯')).toBeInTheDocument()
    expect(screen.getByText('文法')).toBeInTheDocument()
  })

  it('marks correct and wrong options after answer', () => {
    render(
      <QuestionCard
        question={mockQ}
        onAnswer={() => {}}
        phase="explanation"
        selectedIndex={1}
      />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAttribute('data-state', 'correct')
    expect(buttons[1]).toHaveAttribute('data-state', 'wrong')
    expect(buttons[2]).toHaveAttribute('data-state', 'disabled')
  })
})
