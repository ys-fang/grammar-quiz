import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import { useGlobalStats } from '../hooks/useGlobalStats'
import { postScore } from '../lib/gas-client'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { ProgressBar } from '../components/quiz/ProgressBar'
import { GlobalStatsBar } from '../components/quiz/GlobalStatsBar'
import { ResultScreen } from '../components/quiz/ResultScreen'
import type { QuizQuestion } from '../types/quiz'

interface TopicData {
  topicId: string
  currentTopic: string
  questions: QuizQuestion[]
}

type LoadState = 'loading' | 'error' | 'success'

// Separate component that renders once data is loaded
function QuizContent({ data, gasUrl }: { data: TopicData; gasUrl: string }) {
  const navigate = useNavigate()
  const { state, answer, next, retryAll, retryWrongs } = useQuiz(data.questions)
  const stats = useGlobalStats(gasUrl, data.currentTopic)
  const [scorePosted, setScorePosted] = useState(false)

  useEffect(() => {
    if (state.phase === 'result' && !scorePosted && state.totalQuestions === data.questions.length) {
      postScore(gasUrl, data.currentTopic, state.percentage)
      setScorePosted(true)
    }
  }, [state.phase, scorePosted, state.totalQuestions, data.questions.length, gasUrl, data.currentTopic, state.percentage])

  return (
    <div className="quiz-page min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← 返回
            </button>
            <GlobalStatsBar count={stats?.count ?? null} avg={stats?.avg ?? null} />
          </div>
          {state.phase !== 'result' && (
            <ProgressBar current={state.currentIndex + 1} total={state.totalQuestions} />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {state.phase === 'result' ? (
          <ResultScreen
            score={state.score}
            total={state.totalQuestions}
            percentage={state.percentage}
            hasWrongs={state.wrongs.length > 0}
            onRetryAll={retryAll}
            onRetryWrongs={retryWrongs}
            onBack={() => navigate('/')}
          />
        ) : (
          <>
            <QuestionCard
              question={state.currentQuestion!}
              onAnswer={answer}
              phase={state.phase}
              selectedIndex={state.selectedIndex}
            />
            {state.phase === 'explanation' && (
              <div className="mt-6 text-center">
                <button
                  onClick={next}
                  className="px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  {state.currentIndex + 1 >= state.totalQuestions ? '查看結果' : '下一題'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export function QuizPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<TopicData | null>(null)
  const [gasUrl, setGasUrl] = useState('')
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!topicId) {
      setLoadState('error')
      setErrorMessage('找不到題目 ID')
      return
    }

    let cancelled = false

    async function loadData() {
      try {
        const [topicResponse, manifestResponse] = await Promise.all([
          fetch(`./data/topics/${topicId}.json`),
          fetch('./data/manifest.json'),
        ])

        if (!topicResponse.ok) {
          throw new Error('找不到此題目')
        }

        if (!manifestResponse.ok) {
          throw new Error('無法載入設定')
        }

        const [topicData, manifest] = await Promise.all([
          topicResponse.json(),
          manifestResponse.json(),
        ])

        if (!cancelled) {
          setData(topicData)
          setGasUrl(manifest.gasUrl || '')
          setLoadState('success')
        }
      } catch (err) {
        console.error('Failed to load quiz data:', err)
        if (!cancelled) {
          setLoadState('error')
          setErrorMessage(err instanceof Error ? err.message : '載入失敗')
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [topicId])

  if (loadState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
        <div className="animate-pulse text-blue-800 text-lg">載入題目中...</div>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">載入失敗</h1>
          <p className="text-slate-600 mb-6">{errorMessage}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              重試
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              返回首頁
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return <QuizContent key={data.topicId} data={data} gasUrl={gasUrl} />
}
