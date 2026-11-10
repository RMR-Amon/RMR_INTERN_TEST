import type { CSSProperties } from 'react'
import { cn } from '@/utils/cn'
import styles from './ProgressBar.module.scss'

interface ProgressBarProps {
  value: number
  max?: number
  height?: number
  tone?: 'brand' | 'success' | 'danger' | 'warning'
  color?: string
  shine?: boolean
  label?: string
  className?: string
}

export function ProgressBar({ value, max = 100, height = 8, tone = 'brand', color, shine, label, className }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      className={cn(styles.track, className)}
      style={{ '--h': `${height}px` } as CSSProperties}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <div
        className={cn(styles.fill, tone !== 'brand' && styles[tone], shine && styles.shine)}
        style={{ width: `${percent}%`, ...(color ? ({ '--fill': color } as CSSProperties) : {}) }}
      />
    </div>
  )
}
