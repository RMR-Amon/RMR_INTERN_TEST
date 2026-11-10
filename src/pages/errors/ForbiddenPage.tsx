import { Home } from 'lucide-react'
import { LinkButton } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useI18n } from '@/locales'
import styles from './ErrorPages.module.scss'

export function ForbiddenPage() {
  const { t } = useI18n()
  useDocumentTitle(t.notFound.forbiddenTitle)
  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.code}>403</div>
        <h1 className={styles.title}>{t.notFound.forbiddenTitle}</h1>
        <p className={styles.text}>{t.notFound.forbiddenText}</p>
        <LinkButton to="/" icon={<Home />}>
          {t.notFound.back}
        </LinkButton>
      </div>
    </div>
  )
}
