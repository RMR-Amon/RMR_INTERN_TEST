import { ChevronRight } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui'
import { TechChips, XPBadge } from '@/components/shared'
import { useI18n } from '@/locales'
import type { TestSessionSummary } from '@/types'
import { cn } from '@/utils/cn'
import { formatClock, formatDate } from '@/utils/format'
import styles from './TestCard.module.scss'

/** Compact summary of a submitted test, links to its result. */
export const TestCard = memo(function TestCard({ session }: { session: TestSessionSummary }) {
  const { t, lang } = useI18n()
  const score = Math.round(session.score_percent ?? 0)
  const tone = score >= 70 ? styles.high : score >= 50 ? styles.mid : styles.low
  return (
    <Link to={`/tests/result/${session.id}`} className={styles.item}>
      <span className={cn(styles.score, tone)}>{score}%</span>
      <span className={styles.body}>
        <span className={styles.top}>
          <Badge tone={session.difficulty}>{t.tests.difficulties[session.difficulty]}</Badge>
          {session.submitted_at && formatDate(session.submitted_at, lang, true)}
          {session.time_spent_seconds != null && ` · ${formatClock(session.time_spent_seconds)}`}
        </span>
        <span className={styles.chips}>
          <TechChips ids={session.technologies} />
        </span>
      </span>
      <span className={styles.right}>
        <XPBadge xp={session.xp_earned} sign />
        <ChevronRight aria-hidden />
      </span>
    </Link>
  )
})

export function TestCardList({ sessions }: { sessions: TestSessionSummary[] }) {
  return (
    <div className={styles.list}>
      {sessions.map((s) => (
        <TestCard key={s.id} session={s} />
      ))}
    </div>
  )
}
