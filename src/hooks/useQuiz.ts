import { useState, useCallback, useMemo } from 'react'
import { createQuizEngine, type QuizState } from '../lib/quiz-engine'
import { shuffle } from '../lib/shuffle'
import type { QuizQuestion } from '../types/quiz'

/** Shuffle options within a question and update correctIndex accordingly */
function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const correctAnswer = question.options[question.correctIndex]
  const shuffledOptions = shuffle(question.options)
  const newCorrectIndex = shuffledOptions.indexOf(correctAnswer)

  return {
    ...question,
    options: shuffledOptions,
    correctIndex: newCorrectIndex,
  }
}

export function useQuiz(questions: QuizQuestion[]) {
  const shuffled = useMemo(() => {
    // Shuffle questions order, then shuffle each question's options
    return shuffle(questions).map(shuffleQuestionOptions)
  }, [questions])
  const [engine] = useState(() => createQuizEngine(shuffled))
  const [state, setState] = useState<QuizState>(() => engine.getState())

  const answer = useCallback(
    (index: number) => setState(engine.answer(index)),
    [engine]
  )

  const next = useCallback(
    () => setState(engine.next()),
    [engine]
  )

  const retryAll = useCallback(() => {
    setState(engine.retryAll())
  }, [engine])

  const retryWrongs = useCallback(() => {
    setState(engine.retryWrongs())
  }, [engine])

  return { state, answer, next, retryAll, retryWrongs }
}
