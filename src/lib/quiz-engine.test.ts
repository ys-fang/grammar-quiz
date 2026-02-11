import { describe, it, expect } from 'vitest'
import { createQuizEngine } from './quiz-engine'
import type { QuizQuestion } from '../types/quiz'

function makeQ(idx: number, correctIdx = 0): QuizQuestion {
  return {
    q: `Question ${idx}`,
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: ['A', 'B', 'C', 'D'][correctIdx],
    correctIndex: correctIdx,
    explanation: { translation: `翻譯${idx}`, grammar: `文法${idx}` },
  }
}

describe('QuizEngine', () => {
  it('initializes with question phase', () => {
    const engine = createQuizEngine([makeQ(1), makeQ(2)])
    expect(engine.getState().phase).toBe('question')
    expect(engine.getState().currentIndex).toBe(0)
    expect(engine.getState().totalQuestions).toBe(2)
  })

  it('answer correct → explanation phase, score increments', () => {
    const engine = createQuizEngine([makeQ(1)])
    const state = engine.answer(0) // correct answer
    expect(state.phase).toBe('explanation')
    expect(state.score).toBe(1)
    expect(state.lastAnswerCorrect).toBe(true)
  })

  it('answer wrong → explanation phase, score stays, wrong recorded', () => {
    const engine = createQuizEngine([makeQ(1)])
    const state = engine.answer(1) // wrong answer
    expect(state.phase).toBe('explanation')
    expect(state.score).toBe(0)
    expect(state.lastAnswerCorrect).toBe(false)
    expect(state.wrongs).toHaveLength(1)
  })

  it('next after last question → result phase', () => {
    const engine = createQuizEngine([makeQ(1)])
    engine.answer(0)
    const state = engine.next()
    expect(state.phase).toBe('result')
    expect(state.score).toBe(1)
    expect(state.totalQuestions).toBe(1)
  })

  it('next moves to next question', () => {
    const engine = createQuizEngine([makeQ(1), makeQ(2)])
    engine.answer(0)
    const state = engine.next()
    expect(state.phase).toBe('question')
    expect(state.currentIndex).toBe(1)
  })

  it('full flow: 3 questions, 2 correct 1 wrong', () => {
    const qs = [makeQ(1, 0), makeQ(2, 1), makeQ(3, 2)]
    const engine = createQuizEngine(qs)

    engine.answer(0) // Q1 correct
    engine.next()

    engine.answer(0) // Q2 wrong (correct is 1)
    engine.next()

    engine.answer(2) // Q3 correct
    const result = engine.next()

    expect(result.phase).toBe('result')
    expect(result.score).toBe(2)
    expect(result.totalQuestions).toBe(3)
    expect(result.wrongs).toHaveLength(1)
    expect(result.wrongs[0].q).toBe('Question 2')
  })

  it('retryAll resets with all questions', () => {
    const qs = [makeQ(1), makeQ(2)]
    const engine = createQuizEngine(qs)
    engine.answer(0)
    engine.next()
    engine.answer(1) // wrong
    engine.next() // result

    const state = engine.retryAll()
    expect(state.phase).toBe('question')
    expect(state.currentIndex).toBe(0)
    expect(state.score).toBe(0)
    expect(state.totalQuestions).toBe(2)
  })

  it('retryWrongs resets with only wrong questions', () => {
    const qs = [makeQ(1, 0), makeQ(2, 1), makeQ(3, 2)]
    const engine = createQuizEngine(qs)

    engine.answer(0) // correct
    engine.next()
    engine.answer(0) // wrong (correct is 1)
    engine.next()
    engine.answer(0) // wrong (correct is 2)
    engine.next() // result

    const state = engine.retryWrongs()
    expect(state.phase).toBe('question')
    expect(state.totalQuestions).toBe(2)
    expect(state.score).toBe(0)
  })

  it('percentage returns correct percentage', () => {
    const engine = createQuizEngine([makeQ(1), makeQ(2)])
    engine.answer(0) // correct
    engine.next()
    engine.answer(1) // wrong
    engine.next()

    expect(engine.getState().percentage).toBe(50)
  })

  it('selectedIndex is tracked per question', () => {
    const engine = createQuizEngine([makeQ(1)])
    expect(engine.getState().selectedIndex).toBeNull()
    const state = engine.answer(2)
    expect(state.selectedIndex).toBe(2)
  })
})
