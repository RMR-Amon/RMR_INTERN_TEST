import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { memo } from 'react'
import { AchievementIcon } from '@/components/shared'
import { useI18n } from '@/locales'
import type { Achievement } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'
import { pickLocalized } from '@/utils/localized'
import styles from './AchievementCard.module.scss'

interface AchievementCardProps {
  achievement: Achievement
  earnedAt?: string | null
  index?: number
}

export const AchievementCard = memo(function AchievementCard({ achievement, earnedAt, index = 0 }: AchievementCardProps) {
  const { t, f, lang } = useI18n()
  const earned = Boolean(earnedAt)
  return (
    <motion.div
      className={cn(styles.card, styles[achievement.tier], earned ? styles.earned : styles.locked)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35 }}
    >
      <span className={styles.medal}>
        <AchievementIcon name={achievement.icon} size={26} />
        {!earned && (
          <span className={styles.lock}>
            <Lock aria-hidden />
          </span>
        )}
      </span>
      <div className={styles.body}>
        <span className={styles.title}>{pickLocalized(achievement.title, lang)}</span>
        <span className={styles.desc}>{pickLocalized(achievement.description, lang)}</span>
        <span className={styles.meta}>
          <span className={styles.tier}>{t.achievements.tiers[achievement.tier]}</span>
          {achievement.xp_bonus > 0 && <span>· {f(t.achievements.reward, { xp: achievement.xp_bonus })}</span>}
          <span>· {earned && earnedAt ? f(t.achievements.earnedOn, { date: formatDate(earnedAt, lang) }) : t.achievements.locked}</span>
        </span>
      </div>
    </motion.div>
  )
})

export function AchievementGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid}>{children}</div>
}
