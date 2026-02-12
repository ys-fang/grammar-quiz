import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QuizPage } from '../../src/pages/QuizPage'
import type { QuizQuestion } from '../../src/types/quiz'

const mockQuestions: QuizQuestion[] = [
  {
    q: 'Question 1: He ______ fast.',
    options: ['run', 'runs', 'running', 'ran'],
    correctAnswer: 'runs',
    correctIndex: 1,
    explanation: { translation: '他跑得很快', grammar: '三單加s' },
  },
  {
    q: 'Question 2: She ______ here.',
    options: ['is', 'are', 'am', 'be'],
    correctAnswer: 'is',
    correctIndex: 0,
    explanation: { translation: '她在這裡', grammar: 'be 動詞' },
  },
]

const mockTopicData = {
  topicId: 'test-topic',
  currentTopic: 'Test_Topic',
  questions: mockQuestions,
}

const mockManifest = {
  gasUrl: 'https://example.com/gas',
  categories: [],
}

// Mock shuffle to return in order for predictable tests
vi.mock('../../src/lib/shuffle', () => ({
  shuffle: <T,>(arr: T[]) => [...arr],
}))

beforeEach(() => {
  vi.restoreAllMocks()
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('manifest.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockManifest) })
    }
    if (url.includes('topics/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTopicData) })
    }
    // GAS URL
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ count: 10, avg: 75 }) })
  }))
})

function renderQuizPage() {
  return render(
    <MemoryRouter initialEntries={['/quiz/test-topic']}>
      <Routes>
        <Route path="/quiz/:topicId" element={<QuizPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Quiz Flow Integration', () => {
  it('loads topic and displays first question', async () => {
    renderQuizPage()

    expect(await screen.findByText(/Question 1/)).toBeInTheDocument()
    expect(screen.getAllByRole('button').filter(b => !b.textContent?.includes('←'))).toHaveLength(4)
  })

  it('completes a full quiz flow: answer → explanation → next → result', async () => {
    const user = userEvent.setup()
    renderQuizPage()

    // Q1: answer correctly
    expect(await screen.findByText(/Question 1/)).toBeInTheDocument()
    await user.click(screen.getByText('runs'))
    expect(screen.getByText('他跑得很快')).toBeInTheDocument()

    await user.click(screen.getByText('下一題'))

    // Q2: answer wrong
    expect(screen.getByText(/Question 2/)).toBeInTheDocument()
    await user.click(screen.getByText('are'))
    expect(screen.getByText('她在這裡')).toBeInTheDocument()

    await user.click(screen.getByText('查看結果'))

    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText(/重新作答/)).toBeInTheDocument()
    expect(screen.getByText(/錯題重做/)).toBeInTheDocument()
  })

  it('retry wrongs flow', async () => {
    const user = userEvent.setup()
    renderQuizPage()

    // Answer Q1 correct, Q2 wrong
    expect(await screen.findByText(/Question 1/)).toBeInTheDocument()
    await user.click(screen.getByText('runs'))
    await user.click(screen.getByText('下一題'))
    await user.click(screen.getByText('are')) // wrong
    await user.click(screen.getByText('查看結果'))

    // Click retry wrongs
    await user.click(screen.getByText(/錯題重做/))

    // Should show only the wrong question
    expect(screen.getByText(/Question 2/)).toBeInTheDocument()
  })
})
