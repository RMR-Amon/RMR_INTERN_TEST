import type { ReactNode } from 'react'
import { Badge } from '@/components/ui'
import { useI18n } from '@/locales'
import type { Difficulty, Localized } from '@/types'
import { pickLocalized } from '@/utils/localized'
import { techColor, techName } from '@/utils/technology'
import { AnswerOption, type AnswerOptionState } from '../AnswerOption/AnswerOption'
import { CodeBlock } from '../CodeBlock/CodeBlock'
import styles from './QuestionCard.module.scss'

interface QuestionCardProps {
  number: number
  total: number
  technology: string
  difficulty: Difficulty
  question: Localized
  code: string | null
  options: Localized[]
  /** state of each option (selection or review colouring) */
  optionState: (index: number) => AnswerOptionState
  disabled?: boolean
  onSelect?: (index: number) => void
  footer?: ReactNode
}

export function QuestionCard({
  number,
  total,
  technology,
  difficulty,
  question,
  code,
  options,
  optionState,
  disabled,
  onSelect,
  footer,
}: QuestionCardProps) {
  const { t, f, lang } = useI18n()
  return (
    <article className={styles.card} aria-labelledby={`q-${number}`}>
      <div className={styles.meta}>
        <span className={styles.number}>{f(t.tests.questionOf, { current: number, total })}</span>
        <Badge color={techColor(technology)}>{techName(technology)}</Badge>
        <Badge tone={difficulty}>{t.tests.difficulties[difficulty]}</Badge>
      </div>
      <h2 id={`q-${number}`} className={styles.question}>
        {pickLocalized(question, lang)}
      </h2>
      {code && <CodeBlock code={code} label={t.tests.codeLabel} />}
      <div className={styles.options} role="radiogroup" aria-labelledby={`q-${number}`}>
        {options.map((option, i) => (
          <AnswerOption
            key={i}
            index={i}
            text={pickLocalized(option, lang)}
            state={optionState(i)}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
      {footer}
    </article>
  )
}
