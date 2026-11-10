import { Layers } from 'lucide-react'
import { Card, CardHeader, ProgressBar } from '@/components/ui'
import { TechIcon } from '@/components/shared'
import { useI18n } from '@/locales'
import type { Technology } from '@/types'
import type { TechStat } from '../lib/stats'
import styles from './Dashboard.module.scss'

/** Available technologies with the student's accuracy in each. */
export function TechnologiesOverview({ technologies, stats }: { technologies: Technology[]; stats: Record<string, TechStat> }) {
  const { t } = useI18n()
  return (
    <Card>
      <CardHeader title={t.dashboard.technologies} icon={<Layers />} />
      <div className={styles.techList}>
        {technologies.map((tech) => {
          const s = stats[tech.id]
          const pct = s?.percent ?? 0
          return (
            <div key={tech.id} className={styles.techItem}>
              <TechIcon id={tech.id} color={tech.color} size={36} />
              <div className={styles.techText}>
                <span>
                  {tech.name}
                  <small>{s ? `${s.correct}/${s.total} · ${t.dashboard.accuracy}` : t.dashboard.notTried}</small>
                </span>
                <ProgressBar value={pct} height={5} color={tech.color} label={tech.name} />
              </div>
              <span className={styles.techPct}>{s ? `${pct}%` : '—'}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
