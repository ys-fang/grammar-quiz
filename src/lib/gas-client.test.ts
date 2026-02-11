import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGlobalStats, postScore } from './gas-client'

const GAS_URL = 'https://script.google.com/macros/s/FAKE/exec'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchGlobalStats', () => {
  it('returns stats on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 42, avg: 85 }),
    }))

    const stats = await fetchGlobalStats(GAS_URL, 'TestTopic')
    expect(stats).toEqual({ count: 42, avg: 85 })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('topic=TestTopic')
    )
  })

  it('returns fallback on fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))

    const stats = await fetchGlobalStats(GAS_URL, 'TestTopic')
    expect(stats).toEqual({ count: 0, avg: 0 })
  })

  it('returns fallback when GAS_URL is empty', async () => {
    const stats = await fetchGlobalStats('', 'TestTopic')
    expect(stats).toEqual({ count: 0, avg: 0 })
  })
})

describe('postScore', () => {
  it('sends score via POST', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    await postScore(GAS_URL, 'TestTopic', 90)
    expect(fetch).toHaveBeenCalledWith(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ topic: 'TestTopic', score: 90 }),
    })
  })

  it('does not throw on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')))

    await expect(postScore(GAS_URL, 'TestTopic', 90)).resolves.toBeUndefined()
  })

  it('skips fetch when GAS_URL is empty', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    await postScore('', 'TestTopic', 90)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
