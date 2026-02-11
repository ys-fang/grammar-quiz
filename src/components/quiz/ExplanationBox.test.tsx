import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ExplanationBox } from './ExplanationBox'

describe('ExplanationBox', () => {
  it('renders translation and grammar', () => {
    render(
      <ExplanationBox
        explanation={{ translation: '中文翻譯', grammar: '文法說明' }}
      />
    )
    expect(screen.getByText('中文翻譯')).toBeInTheDocument()
    expect(screen.getByText('文法說明')).toBeInTheDocument()
  })

  it('renders vocab when provided', () => {
    render(
      <ExplanationBox
        explanation={{ translation: '翻譯', grammar: '文法', vocab: 'word [wɜːrd] (n.)' }}
      />
    )
    expect(screen.getByText('word [wɜːrd] (n.)')).toBeInTheDocument()
  })

  it('renders restore when provided', () => {
    render(
      <ExplanationBox
        explanation={{ translation: '翻譯', grammar: '文法', restore: 'Original sentence.' }}
      />
    )
    expect(screen.getByText('Original sentence.')).toBeInTheDocument()
  })

  it('does not render vocab section when absent', () => {
    render(
      <ExplanationBox explanation={{ translation: '翻譯', grammar: '文法' }} />
    )
    expect(screen.queryByText(/單字/)).not.toBeInTheDocument()
  })
})
