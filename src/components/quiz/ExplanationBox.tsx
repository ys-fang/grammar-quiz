interface Props {
  explanation: {
    translation: string
    grammar: string
    vocab?: string
    restore?: string
  }
}

export function ExplanationBox({ explanation }: Props) {
  return (
    <div className="explanation-box mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2 text-sm">
      <div>
        <span className="font-semibold text-blue-700">翻譯：</span>
        <span>{explanation.translation}</span>
      </div>
      <div>
        <span className="font-semibold text-blue-700">文法：</span>
        <span>{explanation.grammar}</span>
      </div>
      {explanation.vocab && (
        <div>
          <span className="font-semibold text-blue-700">單字：</span>
          <span>{explanation.vocab}</span>
        </div>
      )}
      {explanation.restore && (
        <div>
          <span className="font-semibold text-blue-700">還原：</span>
          <span>{explanation.restore}</span>
        </div>
      )}
    </div>
  )
}
