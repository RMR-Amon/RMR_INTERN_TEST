import { Medal } from 'lucide-react'
import { Card, CardHeader, EmptyState } from '@/components/ui'
import { TechIcon } from '@/components/shared'
import type { TechStat } from '@/features/dashboard/lib/stats'
import { useI18n } from '@/locales'
import { techColor, techName } from '@/utils/technology'
import styles from './Profile.module.scss'

/** Personal best score in each technology. */
export function PersonalBests({ stats }: { stats: Record<string, TechStat> }) {
  const { t } = useI18n()
  const items = Object.values(stats).sort((a, b) => b.best - a.best)
  return (
    <Card>
      <CardHeader title={t.history.personalBests} icon={<Medal />} />
      {items.length === 0 ? (
        <EmptyState title={t.dashboard.noTests} text={t.dashboard.noTestsHint} />
      ) : (
        <div className={styles.best}>
          {items.map((s) => (
            <div key={s.technology} className={styles.bestItem}>
              <TechIcon id={s.technology} color={techColor(s.technology)} size={36} />
              <div>
                <span>{techName(s.technology)}</span>
                <strong>{s.best}%</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
