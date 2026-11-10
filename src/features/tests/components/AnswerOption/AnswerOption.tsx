import { CheckCircle2, XCircle } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/utils/cn'
import styles from './AnswerOption.module.scss'

export type AnswerOptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed'

interface AnswerOptionProps {
  index: number
  text: string
  state: AnswerOptionState
  disabled?: boolean
  onSelect?: (index: number) => void
}

const LETTERS = ['A', 'B', 'C', 'D']
// Options that look like code/markup are rendered in monospace
const looksLikeCode = (text: string) =>
  text.length < 100 && text.split(' ').length <= 8 && /[<>{};=$`]|\w\(|^[.@#['"]/.test(text)

export const AnswerOption = memo(function AnswerOption({ index, text, state, disabled, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={state === 'selected'}
      className={cn(
        styles.option,
        state === 'selected' && styles.selected,
        state === 'correct' && styles.correct,
        state === 'wrong' && styles.wrong,
        state === 'dimmed' && styles.dimmed,
      )}
      disabled={disabled}
      onClick={() => onSelect?.(index)}
    >
      <span className={styles.key} aria-hidden>
        {LETTERS[index]}
      </span>
      <span className={cn(styles.text, looksLikeCode(text) && styles.code)}>{text}</span>
      {(state === 'correct' || state === 'wrong') && (
        <span className={styles.status} aria-hidden>
          {state === 'correct' ? <CheckCircle2 /> : <XCircle />}
        </span>
      )}
    </button>
  )
})
