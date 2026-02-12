import { useState, useCallback, useMemo, useEffect } from 'react'
import { createQuizEngine, type QuizState } from '../lib/quiz-engine'
import { shuffle } from '../lib/shuffle'
import {
  saveQuizProgress,
  loadQuizProgress,
  clearQuizProgress,
} from '../lib/quiz-storage'
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

export function useQuiz(questions: QuizQuestion[], topicId: string) {
  // Try to restore saved progress, otherwise shuffle fresh
  const { initialQuestions, restoredState } = useMemo(() => {
    const saved = loadQuizProgress(topicId)
    if (saved && saved.questions.length > 0) {
      // Restore from saved progress (questions already shuffled)
      return {
        initialQuestions: saved.questions,
        restoredState: {
          phase: saved.phase,
          questions: saved.questions,
          currentIndex: saved.currentIndex,
          score: saved.score,
          wrongs: saved.wrongs,
          lastAnswerCorrect: saved.lastAnswerCorrect,
          selectedIndex: saved.selectedIndex,
        },
      }
    }
    // Start fresh with shuffled questions
    return {
      initialQuestions: shuffle(questions).map(shuffleQuestionOptions),
      restoredState: undefined,
    }
  }, [questions, topicId])

  const [engine] = useState(() => createQuizEngine(initialQuestions, restoredState))
  const [state, setState] = useState<QuizState>(() => engine.getState())

  // Save progress whenever state changes (except for result phase)
  useEffect(() => {
    if (state.phase === 'result') {
      // Clear progress when quiz is completed
      clearQuizProgress(topicId)
    } else {
      // Save current progress
      saveQuizProgress(topicId, {
        questions: state.questions,
        currentIndex: state.currentIndex,
        score: state.score,
        wrongs: state.wrongs,
        phase: state.phase,
        lastAnswerCorrect: state.lastAnswerCorrect,
        selectedIndex: state.selectedIndex,
      })
    }
  }, [state, topicId])

  const answer = useCallback(
    (index: number) => setState(engine.answer(index)),
    [engine]
  )

  const next = useCallback(
    () => setState(engine.next()),
    [engine]
  )

  const retryAll = useCallback(() => {
    // Clear saved progress and reshuffle for retry
    clearQuizProgress(topicId)
    setState(engine.retryAll())
  }, [engine, topicId])

  const retryWrongs = useCallback(() => {
    // Clear saved progress for retry
    clearQuizProgress(topicId)
    setState(engine.retryWrongs())
  }, [engine, topicId])

  return { state, answer, next, retryAll, retryWrongs }
}
