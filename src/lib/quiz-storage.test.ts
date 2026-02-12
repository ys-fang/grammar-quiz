import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveQuizProgress,
  loadQuizProgress,
  clearQuizProgress,
  type StoredQuizProgress,
} from './quiz-storage'
import type { QuizQuestion } from '../types/quiz'

const mockQuestion: QuizQuestion = {
  q: 'Test question',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 'A',
  correctIndex: 0,
  explanation: {
    translation: 'Translation',
    grammar: 'Grammar note',
  },
}

const mockProgress: Omit<StoredQuizProgress, 'savedAt'> = {
  questions: [mockQuestion],
  currentIndex: 2,
  score: 1,
  wrongs: [],
  phase: 'question',
  lastAnswerCorrect: true,
  selectedIndex: null,
}

describe('quiz-storage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('saveQuizProgress', () => {
    it('saves progress to sessionStorage', () => {
      saveQuizProgress('topic1', mockProgress)
      const stored = sessionStorage.getItem('quiz-progress-topic1')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.currentIndex).toBe(2)
      expect(parsed.score).toBe(1)
      expect(parsed.savedAt).toBeDefined()
    })

    it('handles storage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full')
      })

      // Should not throw
      expect(() => saveQuizProgress('topic1', mockProgress)).not.toThrow()
      expect(consoleSpy).toHaveBeenCalled()

      mockSetItem.mockRestore()
      consoleSpy.mockRestore()
    })
  })

  describe('loadQuizProgress', () => {
    it('loads saved progress', () => {
      saveQuizProgress('topic1', mockProgress)
      const loaded = loadQuizProgress('topic1')
      expect(loaded).not.toBeNull()
      expect(loaded!.currentIndex).toBe(2)
      expect(loaded!.score).toBe(1)
      expect(loaded!.phase).toBe('question')
    })

    it('returns null if no progress exists', () => {
      const loaded = loadQuizProgress('nonexistent')
      expect(loaded).toBeNull()
    })

    it('returns null and clears for invalid data', () => {
      sessionStorage.setItem('quiz-progress-topic1', 'invalid json')
      const loaded = loadQuizProgress('topic1')
      expect(loaded).toBeNull()
      expect(sessionStorage.getItem('quiz-progress-topic1')).toBeNull()
    })

    it('returns null and clears for incomplete data', () => {
      sessionStorage.setItem('quiz-progress-topic1', JSON.stringify({ score: 1 }))
      const loaded = loadQuizProgress('topic1')
      expect(loaded).toBeNull()
    })

    it('returns null and clears for result phase (completed quiz)', () => {
      const completedProgress = { ...mockProgress, phase: 'result' as const }
      saveQuizProgress('topic1', completedProgress)
      const loaded = loadQuizProgress('topic1')
      expect(loaded).toBeNull()
    })

    it('returns null and clears for expired progress (over 24 hours)', () => {
      const oldProgress: StoredQuizProgress = {
        ...mockProgress,
        savedAt: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      }
      sessionStorage.setItem('quiz-progress-topic1', JSON.stringify(oldProgress))
      const loaded = loadQuizProgress('topic1')
      expect(loaded).toBeNull()
    })
  })

  describe('clearQuizProgress', () => {
    it('removes saved progress', () => {
      saveQuizProgress('topic1', mockProgress)
      expect(sessionStorage.getItem('quiz-progress-topic1')).not.toBeNull()
      clearQuizProgress('topic1')
      expect(sessionStorage.getItem('quiz-progress-topic1')).toBeNull()
    })

    it('handles missing key gracefully', () => {
      // Should not throw
      expect(() => clearQuizProgress('nonexistent')).not.toThrow()
    })
  })
})
