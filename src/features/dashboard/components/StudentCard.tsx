import { Avatar, ProgressBar } from '@/components/ui'
import { LevelBadge, XPBadge } from '@/components/shared'
import { useI18n } from '@/locales'
import type { Profile } from '@/types'
import { getLevelProgress } from '@/utils/level'
import styles from './Dashboard.module.scss'

/** Compact profile card: level, XP progress, rank, streak. */
export function StudentCard({ profile, rank }: { profile: Profile; rank: number | null }) {
  const { t, f } = useI18n()
  const progress = getLevelProgress(profile.xp)
  return (
    <div className={styles.student}>
      <div className={styles.studentTop}>
        <Avatar name={profile.full_name} src={profile.avatar_url} size={52} ring />
        <div className={styles.studentName}>
          <strong>{profile.full_name}</strong>
          <span>@{profile.username}</span>
        </div>
      </div>
      <div className={styles.levelRow}>
        <LevelBadge level={progress.level} />
        <XPBadge xp={profile.xp} />
      </div>
      <ProgressBar value={progress.percent} height={8} shine label={t.common.level} />
      <div className={styles.levelRow}>
        <span>
          {progress.current} / {progress.required} XP
        </span>
        <span>{f(t.dashboard.xpToNext, { xp: progress.required - progress.current, level: progress.level + 1 })}</span>
      </div>
      <div className={styles.studentStats}>
        <div>
          <strong>{rank ? `#${rank}` : t.dashboard.unranked}</strong>
          <span>{t.common.rank}</span>
        </div>
        <div>
          <strong>{profile.tests_completed}</strong>
          <span>{t.leaderboard.tests}</span>
        </div>
        <div>
          <strong>{profile.current_streak}</strong>
          <span>{t.dashboard.streak}</span>
        </div>
      </div>
    </div>
  )
}
