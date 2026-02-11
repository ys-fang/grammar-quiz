import { useState, useCallback, useMemo } from 'react'
import { createQuizEngine, type QuizState } from '../lib/quiz-engine'
import { shuffle } from '../lib/shuffle'
import type { QuizQuestion } from '../types/quiz'

export function useQuiz(questions: QuizQuestion[]) {
  const shuffled = useMemo(() => shuffle(questions), [questions])
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
