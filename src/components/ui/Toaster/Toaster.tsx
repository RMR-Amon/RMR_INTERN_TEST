import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useI18n } from '@/locales'
import { useToastStore, type ToastVariant } from '@/store/toastStore'
import { cn } from '@/utils/cn'
import styles from './Toaster.module.scss'

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  const { t } = useI18n()

  return (
    <div className={styles.region} role="region" aria-live="polite" aria-label="Notifications">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant]
          return (
            <motion.div
              key={toast.id}
              layout
              className={cn(styles.toast, styles[toast.variant])}
              role={toast.variant === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.16 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <span className={styles.icon}>
                <Icon />
              </span>
              <p className={styles.message}>{toast.message}</p>
              <button type="button" className={styles.close} onClick={() => dismiss(toast.id)} aria-label={t.common.close}>
                <X />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
