import { Clock, Save, Scale, SlidersHorizontal, Zap } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, CardHeader, ErrorState, Input, SkeletonCard } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { testsApi } from '@/features/tests/api/testsApi'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { toast } from '@/store/toastStore'
import type { AppSettings } from '@/types'
import { adminApi } from '../api/adminApi'
import styles from './Admin.module.scss'

type Key = keyof AppSettings

const GROUPS: { id: 'limits' | 'xp' | 'fairness'; icon: React.ReactNode; fields: Key[] }[] = [
  {
    id: 'limits',
    icon: <Clock />,
    fields: ['min_questions', 'max_questions', 'default_questions', 'min_duration_minutes', 'max_duration_minutes', 'default_duration_minutes'],
  },
  { id: 'xp', icon: <Zap />, fields: ['easy_xp', 'medium_xp', 'hard_xp', 'completion_bonus', 'high_score_bonus', 'perfect_bonus'] },
  { id: 'fairness', icon: <Scale />, fields: ['completion_min_score', 'repeat_xp_percent', 'daily_bonus_cap'] },
]

const validate = (s: AppSettings) =>
  s.min_questions >= 1 &&
  s.min_questions <= s.default_questions &&
  s.default_questions <= s.max_questions &&
  s.min_duration_minutes >= 1 &&
  s.min_duration_minutes <= s.default_duration_minutes &&
  s.default_duration_minutes <= s.max_duration_minutes &&
  s.completion_min_score <= 100 &&
  s.repeat_xp_percent <= 100

export function TestSettingsForm() {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const { data, loading, error, reload } = useAsync(() => testsApi.getSettings(), [])

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <PageHeader eyebrow={<><SlidersHorizontal /> {t.nav.admin}</>} title={t.admin.settingsTitle} subtitle={t.admin.settingsSubtitle} />
      {error ? (
        <ErrorState message={toMessage(error)} onRetry={reload} />
      ) : loading || !data ? (
        <SkeletonCard lines={6} height={360} />
      ) : (
        <SettingsEditor key={JSON.stringify(data)} initial={data} onSaved={reload} />
      )}
    </div>
  )
}

function SettingsEditor({ initial, onSaved }: { initial: AppSettings; onSaved: () => void }) {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const [values, setValues] = useState<AppSettings>(initial)
  const [saving, setSaving] = useState(false)
  const valid = validate(values)

  const save = async () => {
    if (!valid) return
    setSaving(true)
    try {
      await adminApi.saveSettings(values)
      toast.success(t.admin.settingsSaved)
      onSaved()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {GROUPS.map((group) => (
        <Card key={group.id}>
          <CardHeader title={t.admin.groups[group.id]} icon={group.icon} />
          <div className={styles.settingsGroup}>
            {group.fields.map((field) => (
              <Input
                key={field}
                type="number"
                min={0}
                label={t.admin.fields[field as keyof typeof t.admin.fields]}
                value={values[field]}
                onChange={(e) => setValues((v) => ({ ...v, [field]: Math.max(0, Math.floor(Number(e.target.value) || 0)) }))}
              />
            ))}
          </div>
        </Card>
      ))}
      {!valid && <p style={{ color: 'var(--danger)' }}>{t.validation.numberRange.replace('{min}', 'min').replace('{max}', 'max')}</p>}
      <div className={styles.stickyActions}>
        <Button size="lg" icon={<Save />} loading={saving} disabled={!valid} onClick={() => void save()}>
          {t.common.save}
        </Button>
      </div>
    </>
  )
}
