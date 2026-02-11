interface Props {
  percentage: number
}

function getMessage(pct: number): string {
  if (pct === 100) return '太厲害了！滿分通過！'
  if (pct >= 80) return '表現不錯！繼續保持！'
  if (pct >= 60) return '還可以，加油！'
  return '再多練習幾次吧！'
}

export function FeedbackMessage({ percentage }: Props) {
  return (
    <p className="text-lg font-medium text-center">{getMessage(percentage)}</p>
  )
}
