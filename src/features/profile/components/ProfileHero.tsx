import { CalendarDays } from 'lucide-react'
import { Avatar, Badge, Card, ProgressBar } from '@/components/ui'
import { LevelBadge, XPBadge } from '@/components/shared'
import { useI18n } from '@/locales'
import type { Profile } from '@/types'
import { formatDate } from '@/utils/format'
import { getLevelProgress } from '@/utils/level'
import styles from './Profile.module.scss'

export function ProfileHero({ profile, rank }: { profile: Profile; rank: number | null }) {
  const { t, f, lang } = useI18n()
  const progress = getLevelProgress(profile.xp)
  return (
    <Card glow>
      <div className={styles.hero}>
        <Avatar name={profile.full_name} src={profile.avatar_url} size={88} ring />
        <div className={styles.identity}>
          <h1 className={styles.name}>{profile.full_name}</h1>
          <div className={styles.meta}>
            <span>@{profile.username}</span>
            <Badge tone={profile.role === 'admin' ? 'secondary' : 'primary'}>{t.profile.role[profile.role]}</Badge>
            {rank && <Badge tone="warning">#{rank}</Badge>}
            <span>
              <CalendarDays size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
              {f(t.profile.memberSince, { date: formatDate(profile.created_at, lang) })}
            </span>
          </div>
        </div>
        <div className={styles.levelBox}>
          <div className={styles.levelText}>
            <LevelBadge level={progress.level} />
            <XPBadge xp={profile.xp} />
          </div>
          <ProgressBar value={progress.percent} height={10} shine label={t.common.level} />
          <div className={styles.levelText}>
            <span>
              {progress.current} / {progress.required} XP
            </span>
            <span>{f(t.dashboard.xpToNext, { xp: progress.required - progress.current, level: progress.level + 1 })}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
