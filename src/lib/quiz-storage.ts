import type { QuizQuestion } from '../types/quiz'
import type { Phase } from './quiz-engine'

export interface StoredQuizProgress {
  /** The shuffled questions array (preserved order) */
  questions: QuizQuestion[]
  /** Current question index */
  currentIndex: number
  /** Current score */
  score: number
  /** Array of incorrectly answered questions */
  wrongs: QuizQuestion[]
  /** Current phase */
  phase: Phase
  /** Last answer correctness */
  lastAnswerCorrect: boolean | null
  /** Selected option index */
  selectedIndex: number | null
  /** Timestamp when progress was saved */
  savedAt: number
}

const STORAGE_KEY_PREFIX = 'quiz-progress-'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

function getStorageKey(topicId: string): string {
  return `${STORAGE_KEY_PREFIX}${topicId}`
}

/**
 * Save quiz progress to sessionStorage
 */
export function saveQuizProgress(
  topicId: string,
  progress: Omit<StoredQuizProgress, 'savedAt'>
): void {
  try {
    const data: StoredQuizProgress = {
      ...progress,
      savedAt: Date.now(),
    }
    sessionStorage.setItem(getStorageKey(topicId), JSON.stringify(data))
  } catch (err) {
    // Silently fail if storage is unavailable or full
    console.warn('Failed to save quiz progress:', err)
  }
}

/**
 * Load quiz progress from sessionStorage
 * Returns null if no valid progress exists
 */
export function loadQuizProgress(topicId: string): StoredQuizProgress | null {
  try {
    const stored = sessionStorage.getItem(getStorageKey(topicId))
    if (!stored) return null

    const data: StoredQuizProgress = JSON.parse(stored)

    // Validate required fields exist
    if (
      !Array.isArray(data.questions) ||
      typeof data.currentIndex !== 'number' ||
      typeof data.score !== 'number' ||
      !Array.isArray(data.wrongs) ||
      !data.phase
    ) {
      clearQuizProgress(topicId)
      return null
    }

    // Check if progress is too old
    if (Date.now() - data.savedAt > MAX_AGE_MS) {
      clearQuizProgress(topicId)
      return null
    }

    // Don't restore if quiz was already completed
    if (data.phase === 'result') {
      clearQuizProgress(topicId)
      return null
    }

    return data
  } catch (err) {
    // Invalid JSON or other error
    console.warn('Failed to load quiz progress:', err)
    clearQuizProgress(topicId)
    return null
  }
}

/**
 * Clear quiz progress from sessionStorage
 */
export function clearQuizProgress(topicId: string): void {
  try {
    sessionStorage.removeItem(getStorageKey(topicId))
  } catch (err) {
    // Silently fail
    console.warn('Failed to clear quiz progress:', err)
  }
}
