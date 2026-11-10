import { motion } from 'framer-motion'
import { Clock3, LayoutDashboard, RotateCcw, Timer } from 'lucide-react'
import { LinkButton } from '@/components/ui'
import { RadialProgress, TechChips } from '@/components/shared'
import { useI18n } from '@/locales'
import type { TestResult } from '@/types'
import { cn } from '@/utils/cn'
import { formatClock } from '@/utils/format'
import { gradeForScore } from '../../lib/xp'
import styles from './TestResult.module.scss'

const item = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.08, duration: 0.4 } }),
}

/** Animated hero with score, stats, XP and actions — the "ResultCard". */
export function ResultSummary({ result }: { result: TestResult }) {
  const { t, f } = useI18n()
  const unanswered = result.answers.filter((a) => a.selected_index == null).length
  const incorrect = result.question_count - result.correct_count - unanswered
  const grade = gradeForScore(result.score_percent)

  const stats = [
    { key: 'correct', label: t.result.correct, value: result.correct_count, cls: styles.good },
    { key: 'incorrect', label: t.result.incorrect, value: incorrect, cls: styles.bad, hint: unanswered ? `${t.result.unanswered}: ${unanswered}` : undefined },
    {
      key: 'xp',
      label: t.result.xpEarned,
      value: `+${result.xp_earned}`,
      cls: styles.xp,
      hint: result.bonus_xp > 0 ? f(t.result.bonus, { xp: result.bonus_xp }) : undefined,
    },
    { key: 'time', label: t.result.duration, value: formatClock(result.time_spent_seconds), hint: `/ ${formatClock(result.duration_seconds)}` },
  ]

  return (
    <motion.section
      className={cn(styles.hero)}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.radial}>
        <RadialProgress value={result.score_percent} caption={t.result.score} />
      </div>
      <div className={styles.heroBody}>
        <motion.h2 className={styles.grade} initial="hidden" animate="show" custom={0} variants={item}>
          {t.result.grades[grade]}
        </motion.h2>
        <motion.div initial="hidden" animate="show" custom={1} variants={item}>
          <TechChips ids={result.technologies} />
        </motion.div>
        {result.auto_submitted && (
          <p className={styles.note}>
            <Timer aria-hidden />
            {t.result.autoSubmitted}
          </p>
        )}
        <div className={styles.stats}>
          {stats.map((s, i) => (
            <motion.div key={s.key} className={cn(styles.stat, s.cls)} initial="hidden" animate="show" custom={i + 2} variants={item}>
              <span>{s.label}</span>
              <strong>{s.value}</strong>
              {s.hint && <small>{s.hint}</small>}
            </motion.div>
          ))}
        </div>
        <motion.div className={styles.actions} initial="hidden" animate="show" custom={6} variants={item}>
          <LinkButton to="/tests" icon={<RotateCcw />}>
            {t.result.tryAgain}
          </LinkButton>
          <LinkButton to="/" variant="secondary" icon={<LayoutDashboard />}>
            {t.result.backToDashboard}
          </LinkButton>
          <LinkButton to="/history" variant="ghost" icon={<Clock3 />}>
            {t.nav.history}
          </LinkButton>
        </motion.div>
      </div>
    </motion.section>
  )
}
