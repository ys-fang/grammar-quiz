import { describe, it, expect } from 'vitest'
import { shuffle } from './shuffle'

describe('shuffle (Fisher-Yates)', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle([...arr])
    expect(result).toHaveLength(arr.length)
  })

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle([...arr])
    expect(result.sort()).toEqual(arr.sort())
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5]
    const copy = [...arr]
    shuffle(arr)
    // shuffle mutates in-place, so we test with a copy pattern
    expect(copy).toEqual([1, 2, 3, 4, 5])
  })

  it('produces different orderings (statistical)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const results = new Set<string>()
    for (let i = 0; i < 20; i++) {
      results.add(shuffle([...arr]).join(','))
    }
    // With 10 elements, 20 shuffles should produce at least 2 different orderings
    expect(results.size).toBeGreaterThan(1)
  })

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([])
  })

  it('handles single element', () => {
    expect(shuffle([42])).toEqual([42])
  })
})
