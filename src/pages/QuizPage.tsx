import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
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
  const [data, setData] = useState<TopicData | null>(null)
  const [gasUrl, setGasUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!topicId) return

    Promise.all([
      fetch(`/data/topics/${topicId}.json`).then(r => {
        if (!r.ok) throw new Error('Topic not found')
        return r.json()
      }),
      fetch('/data/manifest.json').then(r => r.json()),
    ])
      .then(([topicData, manifest]) => {
        setData(topicData)
        setGasUrl(manifest.gasUrl || '')
      })
      .catch(err => setError(err.message))
  }, [topicId])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">載入失敗：{error}</p>
      </div>
    )
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen">載入中...</div>
  }

  return <QuizContent key={data.topicId} data={data} gasUrl={gasUrl} />
}
