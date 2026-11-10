import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Suspense } from 'react'
import { Link, Outlet } from 'react-router'
import { LanguageSwitcher, Logo, ThemeSwitcher } from '@/components/shared'
import { Spinner } from '@/components/ui'
import { SeasonalGreeting } from '@/features/seasonal-effects'
import { useI18n } from '@/locales'
import styles from './AuthLayout.module.scss'

/** Split-screen layout for login / register / password recovery. */
export function AuthLayout() {
  const { t } = useI18n()
  return (
    <div className={styles.wrap}>
      <aside className={styles.hero}>
        <Logo />
        <motion.div
          className={styles.heroBody}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SeasonalGreeting />
          <h1 className={styles.heroTitle}>
            <em>{t.auth.heroTitle}</em>
          </h1>
          <p className={styles.heroText}>{t.auth.heroSubtitle}</p>
          <ul className={styles.features}>
            {t.auth.heroFeatures.map((feature) => (
              <li key={feature}>
                <CheckCircle2 aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
          <div className={styles.codeCard} aria-hidden>
            <div>
              <b>const</b> intern = <b>await</b> <i>mars</i>.<i>test</i>({'{'}
            </div>
            <div>&nbsp;&nbsp;stack: [<u>'html'</u>, <u>'css'</u>, <u>'js'</u>, <u>'react'</u>],</div>
            <div>&nbsp;&nbsp;goal: <u>'hired'</u>,</div>
            <div>{'})'}</div>
          </div>
        </motion.div>
        <p className={styles.heroFooter}>© {new Date().getFullYear()} {t.common.org} · {t.common.appName}</p>
      </aside>

      <section className={styles.panel}>
        <div className={styles.topbar}>
          <Link to="/login" className={styles.mobileLogo} aria-label={t.common.appName}>
            <Logo />
          </Link>
          <div className={styles.controls}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <div className={styles.formArea}>
          <motion.div
            className={styles.formCard}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
