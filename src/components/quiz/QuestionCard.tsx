import type { QuizQuestion } from '../../types/quiz'
import type { Phase } from '../../lib/quiz-engine'
import { OptionButton, type OptionState } from './OptionButton'
import { ExplanationBox } from './ExplanationBox'

interface Props {
  question: QuizQuestion
  onAnswer: (index: number) => void
  phase: Phase
  selectedIndex: number | null
}

function getOptionState(
  optionIndex: number,
  correctIndex: number,
  selectedIndex: number | null,
  phase: Phase
): OptionState {
  if (phase === 'question') return 'default'

  if (optionIndex === correctIndex) return 'correct'
  if (optionIndex === selectedIndex) return 'wrong'
  return 'disabled'
}

export function QuestionCard({ question, onAnswer, phase, selectedIndex }: Props) {
  return (
    <div className="question-card space-y-4">
      <p
        className="text-lg font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question.q }}
      />

      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            label={opt}
            index={i}
            state={getOptionState(i, question.correctIndex, selectedIndex, phase)}
            onClick={onAnswer}
          />
        ))}
      </div>

      {phase === 'explanation' && (
        <ExplanationBox explanation={question.explanation} />
      )}
    </div>
  )
}
