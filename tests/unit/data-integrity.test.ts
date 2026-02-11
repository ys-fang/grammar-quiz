import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const TOPICS_DIR = join(import.meta.dirname, '../../public/data/topics')
const MANIFEST_PATH = join(import.meta.dirname, '../../public/data/manifest.json')

const topicFiles = readdirSync(TOPICS_DIR).filter(f => f.endsWith('.json'))

describe('Data integrity', () => {
  it('has exactly 55 topic JSON files', () => {
    expect(topicFiles).toHaveLength(55)
  })

  it('manifest.json has valid structure', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
    expect(manifest.gasUrl).toMatch(/^https:\/\/script\.google\.com/)
    expect(manifest.categories).toHaveLength(5)

    let totalTopics = 0
    for (const cat of manifest.categories) {
      expect(cat.categoryTitle).toBeTruthy()
      expect(cat.topics.length).toBeGreaterThan(0)
      for (const t of cat.topics) {
        expect(t.name).toBeTruthy()
        expect(t.slug).toBeTruthy()
        expect(t.topicId).toBeTruthy()
      }
      totalTopics += cat.topics.length
    }
    expect(totalTopics).toBe(55)
  })

  describe.each(topicFiles)('%s', (filename) => {
    const data = JSON.parse(readFileSync(join(TOPICS_DIR, filename), 'utf-8'))

    it('has topicId and currentTopic', () => {
      expect(data.topicId).toBeTruthy()
      expect(data.currentTopic).toBeTruthy()
    })

    it('has at least 1 question', () => {
      expect(data.questions.length).toBeGreaterThan(0)
    })

    it('all questions have valid correctIndex within options range', () => {
      for (const q of data.questions) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex).toBeLessThan(q.options.length)
      }
    })

    it('correctAnswer matches options[correctIndex]', () => {
      for (const q of data.questions) {
        expect(q.correctAnswer).toBe(q.options[q.correctIndex])
      }
    })

    it('all questions have non-empty required fields', () => {
      for (const q of data.questions) {
        expect(q.q).toBeTruthy()
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        expect(q.correctAnswer).toBeTruthy()
        expect(q.explanation.translation).toBeTruthy()
        expect(q.explanation.grammar).toBeTruthy()
      }
    })
  })
})
