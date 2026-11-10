import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './AuthForm.module.scss'

export function FormNotice({ tone = 'success', children }: { tone?: 'success' | 'error'; children: ReactNode }) {
  return (
    <div className={cn(styles.notice, tone === 'error' && styles.error)} role={tone === 'error' ? 'alert' : 'status'}>
      {tone === 'error' ? <AlertTriangle aria-hidden /> : <CheckCircle2 aria-hidden />}
      <span>{children}</span>
    </div>
  )
}
