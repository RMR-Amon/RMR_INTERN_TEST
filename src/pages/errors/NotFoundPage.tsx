import { Home } from 'lucide-react'
import { LinkButton } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useI18n } from '@/locales'
import { cn } from '@/utils/cn'
import styles from './ErrorPages.module.scss'

export default function NotFoundPage() {
  const { t } = useI18n()
  useDocumentTitle(t.notFound.title)
  return (
    <main className={cn(styles.screen, styles.full)}>
      <div className={styles.card}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>{t.notFound.title}</h1>
        <p className={styles.text}>{t.notFound.text}</p>
        <LinkButton to="/" icon={<Home />}>
          {t.notFound.back}
        </LinkButton>
      </div>
    </main>
  )
}
