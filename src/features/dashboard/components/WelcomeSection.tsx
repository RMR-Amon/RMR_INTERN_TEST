import { motion } from 'framer-motion'
import { AlertTriangle, Play, Trophy } from 'lucide-react'
import { LinkButton } from '@/components/ui'
import { SeasonalGreeting } from '@/features/seasonal-effects'
import { useI18n } from '@/locales'
import type { Profile } from '@/types'
import styles from './Dashboard.module.scss'
import { StudentCard } from './StudentCard'

interface WelcomeSectionProps {
  profile: Profile
  rank: number | null
  activeSessionId: string | null
}

export function WelcomeSection({ profile, rank, activeSessionId }: WelcomeSectionProps) {
  const { t } = useI18n()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? t.dashboard.greetingMorning : hour < 18 ? t.dashboard.greetingDay : t.dashboard.greetingEvening
  const firstName = profile.full_name.split(' ')[0]

  return (
    <motion.section
      className={styles.welcome}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.welcomeText}>
        <div className={styles.seasonMobile}>
          <SeasonalGreeting />
        </div>
        <span className={styles.greeting}>{greeting},</span>
        <h1 className={styles.name}>
          <span>{firstName}</span>
        </h1>
        <p className={styles.welcomeSub}>{t.dashboard.subtitle}</p>
        {activeSessionId && (
          <p className={styles.activeBanner}>
            <AlertTriangle aria-hidden />
            {t.dashboard.activeTestBanner}
          </p>
        )}
        <div className={styles.welcomeActions}>
          {activeSessionId ? (
            <LinkButton to={`/tests/session/${activeSessionId}`} size="lg" icon={<Play />}>
              {t.dashboard.continueTest}
            </LinkButton>
          ) : (
            <LinkButton to="/tests" size="lg" icon={<Play />}>
              {t.dashboard.startTest}
            </LinkButton>
          )}
          <LinkButton to="/leaderboard" size="lg" variant="secondary" icon={<Trophy />}>
            {t.nav.leaderboard}
          </LinkButton>
        </div>
      </div>
      <StudentCard profile={profile} rank={rank} />
    </motion.section>
  )
}
