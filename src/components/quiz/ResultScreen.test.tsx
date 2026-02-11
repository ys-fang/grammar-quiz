import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ResultScreen } from './ResultScreen'

describe('ResultScreen', () => {
  it('shows score and percentage', () => {
    render(
      <ResultScreen
        score={8}
        total={10}
        percentage={80}
        hasWrongs={true}
        onRetryAll={() => {}}
        onRetryWrongs={() => {}}
        onBack={() => {}}
      />
    )
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText(/答對/)).toBeInTheDocument()
  })

  it('shows retry all button', async () => {
    const onRetryAll = vi.fn()
    render(
      <ResultScreen
        score={5}
        total={10}
        percentage={50}
        hasWrongs={true}
        onRetryAll={onRetryAll}
        onRetryWrongs={() => {}}
        onBack={() => {}}
      />
    )
    await userEvent.click(screen.getByText(/重新作答/))
    expect(onRetryAll).toHaveBeenCalled()
  })

  it('shows retry wrongs button when there are wrongs', async () => {
    const onRetryWrongs = vi.fn()
    render(
      <ResultScreen
        score={5}
        total={10}
        percentage={50}
        hasWrongs={true}
        onRetryAll={() => {}}
        onRetryWrongs={onRetryWrongs}
        onBack={() => {}}
      />
    )
    await userEvent.click(screen.getByText(/錯題重做/))
    expect(onRetryWrongs).toHaveBeenCalled()
  })

  it('hides retry wrongs button at 100%', () => {
    render(
      <ResultScreen
        score={10}
        total={10}
        percentage={100}
        hasWrongs={false}
        onRetryAll={() => {}}
        onRetryWrongs={() => {}}
        onBack={() => {}}
      />
    )
    expect(screen.queryByText(/錯題重做/)).not.toBeInTheDocument()
  })

  it('shows back button', async () => {
    const onBack = vi.fn()
    render(
      <ResultScreen
        score={10}
        total={10}
        percentage={100}
        hasWrongs={false}
        onRetryAll={() => {}}
        onRetryWrongs={() => {}}
        onBack={onBack}
      />
    )
    await userEvent.click(screen.getByText(/回到首頁/))
    expect(onBack).toHaveBeenCalled()
  })
})
