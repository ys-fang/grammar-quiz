export type OptionState = 'default' | 'correct' | 'wrong' | 'disabled'

interface Props {
  label: string
  index: number
  state?: OptionState
  onClick: (index: number) => void
}

export function OptionButton({ label, index, state = 'default', onClick }: Props) {
  const disabled = state !== 'default'

  return (
    <button
      type="button"
      data-state={state}
      disabled={disabled}
      onClick={() => onClick(index)}
      className="option-btn w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200
        data-[state=default]:border-slate-200 data-[state=default]:hover:border-blue-400 data-[state=default]:hover:bg-blue-50
        data-[state=correct]:border-green-500 data-[state=correct]:bg-green-50 data-[state=correct]:text-green-800
        data-[state=wrong]:border-red-500 data-[state=wrong]:bg-red-50 data-[state=wrong]:text-red-800
        data-[state=disabled]:border-slate-200 data-[state=disabled]:opacity-50 data-[state=disabled]:cursor-not-allowed"
    >
      {label}
    </button>
  )
}
