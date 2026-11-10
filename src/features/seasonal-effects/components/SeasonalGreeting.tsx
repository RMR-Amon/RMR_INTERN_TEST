import { Apple, Flower2, Leaf, Snowflake } from 'lucide-react'
import { useI18n } from '@/locales'
import type { Season } from '@/types'
import { cn } from '@/utils/cn'
import { useSeason } from '../hooks/useSeason'
import styles from './SeasonalGreeting.module.scss'

const ICONS: Record<Season, typeof Leaf> = { spring: Flower2, summer: Apple, autumn: Leaf, winter: Snowflake }

/** Small localized seasonal message shown on the dashboard. */
export function SeasonalGreeting() {
  const { t } = useI18n()
  const { season } = useSeason()
  const Icon = ICONS[season]
  return (
    <p className={cn(styles.greeting, styles[season])}>
      <Icon aria-hidden />
      <span>{t.seasons.messages[season]}</span>
    </p>
  )
}
