import { useI18n } from '@/locales'
import { cn } from '@/utils/cn'
import { formatClock } from '@/utils/format'
import styles from './CountdownTimer.module.scss'

interface CountdownTimerProps {
  remaining: number
  total: number
}

const R = 12
const C = 2 * Math.PI * R

export function CountdownTimer({ remaining, total }: CountdownTimerProps) {
  const { t } = useI18n()
  const ratio = total > 0 ? remaining / total : 0
  const level = remaining <= 30 ? 'critical' : ratio <= 0.2 ? 'warning' : 'normal'

  return (
    <div
      className={cn(styles.timer, level !== 'normal' && styles[level])}
      role="timer"
      aria-live={remaining <= 60 && remaining % 15 === 0 ? 'assertive' : 'off'}
      aria-label={`${t.tests.timeLeft}: ${formatClock(remaining)}`}
    >
      <span className={styles.ring} aria-hidden>
        <svg width="30" height="30" viewBox="0 0 30 30">
          <circle className={styles.track} cx="15" cy="15" r={R} />
          <circle className={styles.value} cx="15" cy="15" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - ratio)} />
        </svg>
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{t.tests.timeLeft}</span>
        <span className={styles.time}>{formatClock(remaining)}</span>
      </span>
    </div>
  )
}
