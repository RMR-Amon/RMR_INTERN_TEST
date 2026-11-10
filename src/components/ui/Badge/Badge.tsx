import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './Badge.module.scss'

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'mixed'

interface BadgeProps {
  tone?: BadgeTone
  /** custom hex color overrides tone */
  color?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', color, icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, !color && styles[tone], className)}
      style={color ? ({ '--tone': color } as CSSProperties) : undefined}
    >
      {icon}
      {children}
    </span>
  )
}
