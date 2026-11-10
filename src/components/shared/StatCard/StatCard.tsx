import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './StatCard.module.scss'

export type StatTone = 'cyan' | 'violet' | 'blue' | 'amber' | 'green' | 'rose'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: StatTone
}

export function StatCard({ icon, label, value, hint, tone = 'cyan' }: StatCardProps) {
  return (
    <div className={cn(styles.stat, styles[tone])}>
      <div className={styles.content}>
        <span className={styles.icon}>{icon}</span>
        <div className={styles.body}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
          {hint && <span className={styles.hint}>{hint}</span>}
        </div>
      </div>
    </div>
  )
}
