import { LanguageSwitcher, Logo } from '@/components/shared'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useI18n } from '@/locales'
import { cn } from '@/utils/cn'
import styles from './ErrorPages.module.scss'

/** Shown when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. */
export function SetupRequiredPage() {
  const { t } = useI18n()
  useDocumentTitle(t.setup.title)
  return (
    <main className={cn(styles.screen, styles.full)}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <h1 className={styles.title}>{t.setup.title}</h1>
        <p className={styles.text}>{t.setup.text}</p>
        <ol className={styles.steps}>
          {t.setup.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <LanguageSwitcher />
      </div>
    </main>
  )
}
