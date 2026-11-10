import { memo } from 'react'
import { useI18n } from '@/locales'
import { cn } from '@/utils/cn'
import styles from './QuestionNavigator.module.scss'

export type NavState = 'empty' | 'answered' | 'correct' | 'wrong'

interface QuestionNavigatorProps {
  states: NavState[]
  current: number
  onSelect: (index: number) => void
  showLegend?: boolean
}

export const QuestionNavigator = memo(function QuestionNavigator({ states, current, onSelect, showLegend }: QuestionNavigatorProps) {
  const { t } = useI18n()
  return (
    <>
      <nav className={styles.nav} aria-label={t.tests.navigator}>
        {states.map((state, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              styles.item,
              state === 'answered' && styles.answered,
              state === 'correct' && styles.correct,
              state === 'wrong' && styles.wrong,
              i === current && styles.current,
            )}
            aria-current={i === current ? 'step' : undefined}
            aria-label={`${i + 1}${state === 'answered' ? ` — ${t.tests.answered}` : ''}`}
            onClick={() => onSelect(i)}
          >
            {i + 1}
          </button>
        ))}
      </nav>
      {showLegend && (
        <div className={styles.legend}>
          <span>
            <i className={styles.dotAnswered} />
            {t.tests.answered}
          </span>
          <span>
            <i />
            {t.tests.unanswered}
          </span>
        </div>
      )}
    </>
  )
})
