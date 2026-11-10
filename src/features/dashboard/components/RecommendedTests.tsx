import { ChevronRight, Flame, Rocket, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardHeader } from '@/components/ui'
import { useI18n } from '@/locales'
import { techName } from '@/utils/technology'
import { presetToQuery, type Recommendation } from '../lib/stats'
import styles from './Dashboard.module.scss'

const ICONS = { focus: Target, start: Rocket, challenge: Flame }

export function RecommendedTests({ items }: { items: Recommendation[] }) {
  const { t, f } = useI18n()
  return (
    <Card>
      <CardHeader title={t.dashboard.recommended} subtitle={t.dashboard.recommendedHint} icon={<Sparkles />} />
      <div className={styles.recs}>
        {items.map((r, i) => {
          const Icon = ICONS[r.kind]
          const title =
            r.kind === 'start'
              ? t.dashboard.recommendedNew
              : r.kind === 'challenge'
                ? t.dashboard.recommendedChallenge
                : f(t.dashboard.recommendedFocus, { tech: techName(r.technology ?? '') })
          return (
            <Link key={i} to={presetToQuery(r)} className={styles.rec}>
              <span className={styles.recIcon}>
                <Icon aria-hidden />
              </span>
              <span className={styles.recBody}>
                <strong>{title}</strong>
                <span>
                  {t.tests.difficulties[r.difficulty]}
                  {r.percent != null && ` · ${r.percent}% ${t.dashboard.accuracy}`}
                </span>
              </span>
              <span className={styles.recArrow}>
                <ChevronRight aria-hidden />
              </span>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
