import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { LANGUAGES, useI18n } from '@/locales'
import { useChangeLanguage } from '@/hooks/useChangeLanguage'
import { usePreferencesStore } from '@/store/preferencesStore'
import styles from './Switchers.module.scss'

export function LanguageSwitcher() {
  const { t, lang } = useI18n()
  const change = useChangeLanguage()
  return (
    <div className={styles.lang} role="group" aria-label={t.language.label}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className={styles.langBtn}
          aria-pressed={lang === code}
          title={t.language.names[code]}
          onClick={() => change(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function ThemeSwitcher() {
  const { t } = useI18n()
  const theme = usePreferencesStore((s) => s.theme)
  const toggle = usePreferencesStore((s) => s.toggleTheme)
  return (
    <button type="button" className={styles.theme} onClick={toggle} aria-label={t.theme.toggle} title={t.theme.toggle}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -16, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex' }}
        >
          {theme === 'dark' ? <Moon /> : <Sun />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
