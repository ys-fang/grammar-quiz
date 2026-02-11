import type { QuizQuestion } from '../types/quiz'

export type Phase = 'question' | 'explanation' | 'result'

export interface QuizState {
  phase: Phase
  questions: QuizQuestion[]
  currentIndex: number
  totalQuestions: number
  score: number
  percentage: number
  wrongs: QuizQuestion[]
  lastAnswerCorrect: boolean | null
  selectedIndex: number | null
  currentQuestion: QuizQuestion | null
}

export interface QuizEngine {
  getState(): QuizState
  answer(optionIndex: number): QuizState
  next(): QuizState
  retryAll(): QuizState
  retryWrongs(): QuizState
}

export function createQuizEngine(questions: QuizQuestion[]): QuizEngine {
  let phase: Phase = 'question'
  let pool = [...questions]
  let allQuestions = [...questions]
  let currentIndex = 0
  let score = 0
  let wrongs: QuizQuestion[] = []
  let lastAnswerCorrect: boolean | null = null
  let selectedIndex: number | null = null

  function getState(): QuizState {
    return {
      phase,
      questions: pool,
      currentIndex,
      totalQuestions: pool.length,
      score,
      percentage: pool.length > 0 ? Math.round((score / pool.length) * 100) : 0,
      wrongs: [...wrongs],
      lastAnswerCorrect,
      selectedIndex,
      currentQuestion: phase !== 'result' ? pool[currentIndex] ?? null : null,
    }
  }

  function answer(optionIndex: number): QuizState {
    if (phase !== 'question') return getState()

    const q = pool[currentIndex]
    selectedIndex = optionIndex
    lastAnswerCorrect = optionIndex === q.correctIndex

    if (lastAnswerCorrect) {
      score++
    } else {
      wrongs.push(q)
    }

    phase = 'explanation'
    return getState()
  }

  function next(): QuizState {
    if (phase !== 'explanation') return getState()

    if (currentIndex + 1 >= pool.length) {
      phase = 'result'
    } else {
      currentIndex++
      phase = 'question'
      selectedIndex = null
      lastAnswerCorrect = null
    }

    return getState()
  }

  function reset(newPool: QuizQuestion[]) {
    pool = [...newPool]
    allQuestions = questions // keep reference to original full set
    currentIndex = 0
    score = 0
    wrongs = []
    lastAnswerCorrect = null
    selectedIndex = null
    phase = 'question'
  }

  function retryAll(): QuizState {
    reset(allQuestions)
    return getState()
  }

  function retryWrongs(): QuizState {
    const wrongsCopy = [...wrongs]
    reset(wrongsCopy)
    return getState()
  }

  return { getState, answer, next, retryAll, retryWrongs }
}
