import { LANGUAGES, useI18n } from '@/locales'
import { SegmentedControl } from '@/components/ui'
import type { Language } from '@/types'
import styles from './Admin.module.scss'

interface LanguageTabsProps {
  value: Language
  onChange: (lang: Language) => void
  /** languages with missing required fields */
  missing: Language[]
}

/** UZ / RU / EN switcher for multilingual admin editors. */
export function LanguageTabs({ value, onChange, missing }: LanguageTabsProps) {
  const { t } = useI18n()
  return (
    <div className={styles.langTabs}>
      <span className={styles.langTabsLabel}>{t.language.label}</span>
      <SegmentedControl<Language>
        ariaLabel={t.language.label}
        value={value}
        onChange={onChange}
        options={LANGUAGES.map((code) => ({
          value: code,
          label: (
            <>
              {code.toUpperCase()}
              {missing.includes(code) && <span className={styles.missing} aria-label="missing" />}
            </>
          ),
        }))}
      />
    </div>
  )
}
