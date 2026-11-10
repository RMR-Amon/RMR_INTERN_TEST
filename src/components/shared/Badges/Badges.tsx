import { Shield, Zap } from 'lucide-react'
import { memo, type CSSProperties } from 'react'
import { useI18n } from '@/locales'
import type { Technology } from '@/types'
import { techColor, techName } from '@/utils/technology'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'
import styles from './Badges.module.scss'

export function XPBadge({ xp, large, sign }: { xp: number; large?: boolean; sign?: boolean }) {
  const { lang } = useI18n()
  return (
    <span className={cn(styles.xp, large && styles.xpLg)}>
      <Zap aria-hidden />
      {sign && xp > 0 ? '+' : ''}
      {formatNumber(xp, lang)} XP
    </span>
  )
}

export function LevelBadge({ level }: { level: number }) {
  const { t } = useI18n()
  return (
    <span className={styles.level} title={`${t.common.level} ${level}`}>
      <Shield aria-hidden />
      {t.common.lvl} {level}
    </span>
  )
}

const GLYPHS: Record<string, string> = {
  html: '</>',
  css: '{ }',
  javascript: 'JS',
  react: 'Re',
  typescript: 'TS',
  scss: 'Sa',
  tailwind: 'tw',
}

export const TechIcon = memo(function TechIcon({ id, color, size = 40 }: { id: string; color?: string; size?: number }) {
  const style = { '--tech': color ?? techColor(id), '--size': `${size}px` } as CSSProperties
  return (
    <span className={styles.tech} style={style} aria-hidden>
      {GLYPHS[id] ?? id.slice(0, 2).toUpperCase()}
    </span>
  )
})

export function TechChips({ ids, technologies }: { ids: string[]; technologies?: Technology[] }) {
  return (
    <span className={styles.chips}>
      {ids.map((id) => (
        <span key={id} className={styles.techChip} style={{ '--tech': techColor(id, technologies) } as CSSProperties}>
          <span className={styles.dot} />
          {techName(id, technologies)}
        </span>
      ))}
    </span>
  )
}
