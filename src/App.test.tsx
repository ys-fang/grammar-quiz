import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'

// Mock fetch for manifest
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({
    gasUrl: 'https://example.com',
    categories: [
      {
        categoryTitle: '時態與動詞變化',
        topics: [{ name: '現在完成式', slug: 'test', topicId: '06-test' }],
      },
    ],
  }),
}))

describe('LandingPage', () => {
  it('renders categories after loading', async () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )
    expect(await screen.findByText('時態與動詞變化')).toBeInTheDocument()
    expect(screen.getByText('現在完成式')).toBeInTheDocument()
  })
})
