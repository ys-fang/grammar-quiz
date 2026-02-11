import { FeedbackMessage } from './FeedbackMessage'

interface Props {
  score: number
  total: number
  percentage: number
  hasWrongs: boolean
  onRetryAll: () => void
  onRetryWrongs: () => void
  onBack: () => void
}

export function ResultScreen({
  score,
  total,
  percentage,
  hasWrongs,
  onRetryAll,
  onRetryWrongs,
  onBack,
}: Props) {
  return (
    <div className="result-screen flex flex-col items-center gap-6 py-8">
      <div className="text-6xl font-bold text-blue-600">{percentage}%</div>

      <p className="text-slate-600">
        答對 <strong>{score}</strong> / <strong>{total}</strong> 題
      </p>

      <FeedbackMessage percentage={percentage} />

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRetryAll}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          重新作答
        </button>
        {hasWrongs && (
          <button
            onClick={onRetryWrongs}
            className="px-6 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
          >
            錯題重做
          </button>
        )}
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-600 font-medium hover:border-slate-400 transition-colors"
        >
          回到首頁
        </button>
      </div>
    </div>
  )
}
