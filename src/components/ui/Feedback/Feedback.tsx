import { AlertTriangle, Inbox } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useI18n } from '@/locales'
import { cn } from '@/utils/cn'
import { Button } from '../Button/Button'
import styles from './Feedback.module.scss'

export function Skeleton({ width = '100%', height = 14, radius, className }: {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  radius?: number
  className?: string
}) {
  return <span className={cn(styles.skeleton, className)} style={{ display: 'block', width, height, borderRadius: radius }} aria-hidden />
}

export function SkeletonCard({ lines = 3, height = 160 }: { lines?: number; height?: number }) {
  return (
    <div className={styles.skeletonCard} style={{ minHeight: height }} aria-busy="true">
      <Skeleton width="40%" height={18} />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={`${90 - i * 12}%`} />
      ))}
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className={styles.spinnerWrap} role="status">
      <span className={styles.spinner} aria-hidden />
      {label && <span>{label}</span>}
    </div>
  )
}

interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  text?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>{icon ?? <Inbox />}</span>
      <h3 className={styles.emptyTitle}>{title}</h3>
      {text && <p className={styles.emptyText}>{text}</p>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useI18n()
  return (
    <div className={cn(styles.empty, styles.danger)} role="alert">
      <span className={styles.emptyIcon}>
        <AlertTriangle />
      </span>
      <h3 className={styles.emptyTitle}>{t.errors.boundaryTitle}</h3>
      <p className={styles.emptyText}>{message}</p>
      {onRetry && (
        <div className={styles.emptyAction}>
          <Button variant="secondary" onClick={onRetry}>
            {t.common.retry}
          </Button>
        </div>
      )}
    </div>
  )
}
