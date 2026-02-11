interface Props {
  count: number | null
  avg: number | null
}

export function GlobalStatsBar({ count, avg }: Props) {
  return (
    <div className="flex gap-4 text-xs text-slate-500">
      <span>
        全球作答：<strong>{count ?? '--'}</strong> 次
      </span>
      <span>
        平均分數：<strong>{avg !== null ? `${avg}%` : '--'}</strong>
      </span>
    </div>
  )
}
