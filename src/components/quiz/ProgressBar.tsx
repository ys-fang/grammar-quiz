interface Props {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
        {current} / {total}
      </span>
    </div>
  )
}
