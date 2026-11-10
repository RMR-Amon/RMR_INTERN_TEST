import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { memo } from 'react'
import { Avatar, Badge, Table, tableStyles, UserCell } from '@/components/ui'
import { LevelBadge, XPBadge } from '@/components/shared'
import { useI18n } from '@/locales'
import type { LeaderboardEntry } from '@/types'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'
import styles from './LeaderboardTable.module.scss'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  /** show XP gained in the period (week/month) vs all-time XP */
  showPodium?: boolean
}

export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const order = [entries[1], entries[0], entries[2]]
  const cls = [styles.second, styles.first, styles.third]
  return (
    <div className={styles.podium}>
      {order.map((entry, i) =>
        entry ? (
          <motion.div
            key={entry.user_id}
            className={cn(styles.place, cls[i])}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: [0.15, 0, 0.3][i], type: 'spring', stiffness: 260, damping: 22 }}
          >
            {i === 1 && (
              <span className={styles.crown}>
                <Crown aria-hidden />
              </span>
            )}
            <Avatar name={entry.full_name} src={entry.avatar_url} size={i === 1 ? 68 : 54} />
            <span className={styles.placeNum}>{entry.rank}</span>
            <span className={styles.placeName}>{entry.full_name}</span>
            <span className={styles.placeXp}>
              <XPBadge xp={entry.xp} />
            </span>
          </motion.div>
        ) : (
          <div key={i} />
        ),
      )}
    </div>
  )
}

export const LeaderboardTable = memo(function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const { t, lang } = useI18n()
  return (
    <Table>
      <thead>
        <tr>
          <th style={{ width: 64 }}>{t.common.rank}</th>
          <th>{t.leaderboard.student}</th>
          <th>{t.leaderboard.level}</th>
          <th className={tableStyles.right}>{t.leaderboard.xp}</th>
          <th className={tableStyles.right}>{t.leaderboard.tests}</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.user_id} className={cn(e.user_id === currentUserId && styles.me)}>
            <td>
              <span className={cn(styles.rank, e.rank <= 3 && styles[`r${e.rank}` as 'r1'])}>{e.rank}</span>
            </td>
            <td>
              <UserCell
                name={e.full_name}
                username={e.username}
                avatar={e.avatar_url}
                extra={e.user_id === currentUserId ? <Badge tone="primary">{t.common.you}</Badge> : undefined}
              />
            </td>
            <td>
              <LevelBadge level={e.level} />
            </td>
            <td className={cn(tableStyles.right, tableStyles.strong)}>{formatNumber(e.xp, lang)}</td>
            <td className={tableStyles.right}>{e.tests_completed}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
})
