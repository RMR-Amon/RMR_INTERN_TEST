import { Globe, Moon, Palette, Settings, Sun } from 'lucide-react'
import { Card, CardHeader, SegmentedControl } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { useChangeLanguage } from '@/hooks/useChangeLanguage'
import { ChangePasswordForm } from '@/features/auth'
import { SeasonalSettings } from '@/features/seasonal-effects'
import { LANGUAGES, useI18n } from '@/locales'
import { usePreferencesStore } from '@/store/preferencesStore'
import type { Language, Theme } from '@/types'

export default function SettingsPage() {
  const { t, lang } = useI18n()
  const changeLanguage = useChangeLanguage()
  const theme = usePreferencesStore((s) => s.theme)
  const setTheme = usePreferencesStore((s) => s.setTheme)

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <PageHeader eyebrow={<><Settings /> {t.nav.settings}</>} title={t.settings.title} subtitle={t.settings.subtitle} />
      <Card>
        <CardHeader title={t.settings.language} subtitle={t.settings.languageHint} icon={<Globe />} />
        <SegmentedControl<Language>
          ariaLabel={t.settings.language}
          value={lang}
          onChange={changeLanguage}
          options={LANGUAGES.map((code) => ({ value: code, label: t.language.names[code] }))}
        />
      </Card>
      <Card>
        <CardHeader title={t.settings.theme} icon={<Palette />} />
        <SegmentedControl<Theme>
          ariaLabel={t.settings.theme}
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'dark', label: t.settings.themes.dark, icon: <Moon /> },
            { value: 'light', label: t.settings.themes.light, icon: <Sun /> },
          ]}
        />
      </Card>
      <SeasonalSettings />
      <ChangePasswordForm />
    </div>
  )
}
