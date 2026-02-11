import type { QuizQuestion } from '../types/quiz'

interface RawInput {
  q: string
  options: string[]
  a?: string
  correct?: number
  trans?: string
  translation?: string
  grammar?: string
  gram?: string
  ana?: string
  vocab?: string
  restore?: string
  orig?: string
}

export function normalizeQuestion(raw: RawInput): QuizQuestion {
  const options = raw.options

  // Determine correct answer and index
  let correctAnswer: string
  let correctIndex: number

  if ('a' in raw && raw.a !== undefined) {
    // Variant A: answer is a string, find its index
    correctAnswer = raw.a
    correctIndex = options.indexOf(raw.a)
  } else {
    // Variants B/C/D/E: answer is an index
    correctIndex = raw.correct!
    correctAnswer = options[correctIndex]
  }

  // Normalize translation: translation > trans
  const translation =
    raw.translation ?? raw.trans ?? ''

  // Normalize grammar: grammar > gram > ana
  const grammar =
    raw.grammar ?? raw.gram ?? raw.ana ?? ''

  // Normalize restore: restore > orig
  const restore = raw.restore ?? raw.orig

  return {
    q: raw.q,
    options,
    correctAnswer,
    correctIndex,
    explanation: {
      translation,
      grammar,
      ...(raw.vocab !== undefined && { vocab: raw.vocab }),
      ...(restore !== undefined && { restore }),
    },
  }
}
