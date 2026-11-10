import { motion } from 'framer-motion'
import { TechIcon } from '@/components/shared'
import { ProgressBar } from '@/components/ui'
import type { TechBreakdown as Breakdown } from '@/types'
import { techColor, techName } from '@/utils/technology'
import styles from './TestResult.module.scss'

/** Score per technology as animated bars. */
export function TechBreakdown({ items }: { items: Breakdown[] }) {
  return (
    <div className={styles.breakdown}>
      {items.map((b, i) => {
        const pct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0
        const tone = pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'danger'
        return (
          <motion.div
            key={b.technology}
            className={styles.techRow}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <TechIcon id={b.technology} color={techColor(b.technology)} size={34} />
            <div className={styles.techInfo}>
              <span>{techName(b.technology)}</span>
              <ProgressBar value={pct} tone={tone} height={6} label={techName(b.technology)} />
            </div>
            <div className={styles.techScore}>
              {pct}%<small>{b.correct}/{b.total}</small>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
