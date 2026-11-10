import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './Card.module.scss'

interface CardProps extends HTMLAttributes<HTMLElement> {
  padding?: 'none' | 'sm' | 'md'
  interactive?: boolean
  glow?: boolean
  as?: 'section' | 'article' | 'div' | 'aside'
}

export function Card({ padding = 'md', interactive, glow, as: Tag = 'section', className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={cn(styles.card, styles[`pad-${padding}`], interactive && styles.interactive, glow && styles.glow, className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  action?: ReactNode
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleWrap}>
        <h2 className={styles.title}>
          {icon}
          {title}
        </h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  )
}
