import { Check, Lock } from 'lucide-react'
import { memo, type CSSProperties } from 'react'
import { TechIcon } from '@/components/shared'
import { useI18n } from '@/locales'
import type { Technology } from '@/types'
import { cn } from '@/utils/cn'
import { pickLocalized } from '@/utils/localized'
import styles from './TechnologyCard.module.scss'

interface TechnologyCardProps {
  technology: Technology
  selected: boolean
  onToggle?: (id: string) => void
}

/** Selectable technology tile. Core technologies are locked (always on). */
export const TechnologyCard = memo(function TechnologyCard({ technology, selected, onToggle }: TechnologyCardProps) {
  const { t, lang } = useI18n()
  const locked = technology.is_core
  return (
    <button
      type="button"
      className={cn(styles.card, selected && styles.selected, locked && styles.locked)}
      style={{ '--tech': technology.color } as CSSProperties}
      onClick={() => !locked && onToggle?.(technology.id)}
      aria-pressed={selected}
      aria-disabled={locked || undefined}
      title={locked ? t.tests.coreHint : undefined}
    >
      <TechIcon id={technology.id} color={technology.color} size={42} />
      <span className={styles.body}>
        <span className={styles.name}>{technology.name}</span>
        <span className={styles.desc}>{pickLocalized(technology.description, lang)}</span>
      </span>
      <span className={styles.check} aria-hidden>
        {locked ? <Lock /> : <Check />}
      </span>
    </button>
  )
})
