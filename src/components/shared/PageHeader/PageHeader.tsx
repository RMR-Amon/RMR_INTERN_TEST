import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import styles from './PageHeader.module.scss'

interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  useDocumentTitle(title)
  return (
    <motion.header
      className={styles.header}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.text}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </motion.header>
  )
}
