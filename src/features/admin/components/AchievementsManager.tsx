import { Medal, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, ConfirmDialog, ErrorState, Input, Modal, Select, Skeleton, Switch, Table, tableStyles } from '@/components/ui'
import { ACHIEVEMENT_ICONS, AchievementIcon, PageHeader } from '@/components/shared'
import { achievementsApi } from '@/features/achievements/api/achievementsApi'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { LANGUAGES, useI18n } from '@/locales'
import { toast } from '@/store/toastStore'
import type { Achievement, AchievementCondition, AchievementTier, Language } from '@/types'
import { emptyLocalized, pickLocalized } from '@/utils/localized'
import { adminApi } from '../api/adminApi'
import styles from './Admin.module.scss'
import { LanguageTabs } from './LocalizedFields'

const CONDITIONS: AchievementCondition[] = [
  'tests_completed',
  'total_xp',
  'level',
  'streak',
  'score_at_least',
  'hard_score',
  'all_technologies',
]
const TIERS: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum']

const blank = (order: number): Achievement => ({
  id: '',
  title: emptyLocalized(),
  description: emptyLocalized(),
  icon: 'award',
  tier: 'bronze',
  xp_bonus: 10,
  condition_type: 'tests_completed',
  condition_value: 1,
  is_active: true,
  sort_order: order,
})

export function AchievementsManager() {
  const { t, lang } = useI18n()
  const toMessage = useErrorMessage()
  const { data, loading, error, reload } = useAsync(() => achievementsApi.list(true), [])
  const [editing, setEditing] = useState<{ item: Achievement; isNew: boolean } | null>(null)
  const [deleting, setDeleting] = useState<Achievement | null>(null)
  const [busy, setBusy] = useState(false)

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deleteAchievement(deleting.id)
      toast.success(t.admin.achievementDeleted)
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow={<><Medal /> {t.nav.admin}</>}
        title={t.admin.achievementsTitle}
        subtitle={t.admin.achievementsSubtitle}
        actions={
          <Button icon={<Plus />} onClick={() => setEditing({ item: blank((data?.length ?? 0) + 1), isNew: true })}>
            {t.admin.newAchievement}
          </Button>
        }
      />
      <Card>
        {error ? (
          <ErrorState message={toMessage(error)} onRetry={reload} />
        ) : loading || !data ? (
          <Skeleton height={320} />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>{t.admin.achTitle}</th>
                <th>{t.admin.conditionType}</th>
                <th>{t.admin.tier}</th>
                <th className={tableStyles.right}>{t.admin.xpBonus}</th>
                <th>{t.common.status}</th>
                <th className={tableStyles.right}>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AchievementIcon name={a.icon} size={18} />
                      <span>
                        <span className={tableStyles.strong}>{pickLocalized(a.title, lang)}</span>
                        <br />
                        <small>{pickLocalized(a.description, lang)}</small>
                      </span>
                    </span>
                  </td>
                  <td>
                    {t.admin.conditions[a.condition_type]} {a.condition_value}
                  </td>
                  <td>{t.achievements.tiers[a.tier]}</td>
                  <td className={tableStyles.right}>+{a.xp_bonus}</td>
                  <td>
                    <Badge tone={a.is_active ? 'success' : 'neutral'}>{a.is_active ? t.common.active : t.common.inactive}</Badge>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button variant="ghost" size="sm" iconOnly icon={<Pencil />} aria-label={t.common.edit} onClick={() => setEditing({ item: a, isNew: false })} />
                      <Button variant="ghost" size="sm" iconOnly icon={<Trash2 />} aria-label={t.common.delete} onClick={() => setDeleting(a)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {editing && (
        <AchievementEditor
          key={editing.item.id || 'new'}
          initial={editing.item}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t.common.delete}
        description={t.admin.deleteAchievementConfirm}
        confirmLabel={t.common.delete}
        danger
        loading={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}

function AchievementEditor({ initial, isNew, onClose, onSaved }: { initial: Achievement; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const [item, setItem] = useState<Achievement>(initial)
  const [lang, setLang] = useState<Language>('uz')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const missing = LANGUAGES.filter((l) => !item.title[l].trim() || !item.description[l].trim())
  const idValid = /^[a-z0-9_]{2,40}$/.test(item.id)

  const save = async () => {
    setSubmitted(true)
    if (missing.length || (isNew && !idValid)) {
      if (missing.length) setLang(missing[0])
      return
    }
    setSaving(true)
    try {
      await adminApi.saveAchievement(item, isNew)
      toast.success(t.admin.achievementSaved)
      onSaved()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const req = (v: string) => (submitted && !v.trim() ? t.validation.required : undefined)

  return (
    <Modal
      open
      onClose={onClose}
      locked={saving}
      size="lg"
      title={isNew ? t.admin.newAchievement : t.admin.editAchievement}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button icon={<Save />} loading={saving} onClick={() => void save()}>
            {t.common.save}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.grid3}>
          <Input
            label={t.admin.achievementId}
            value={item.id}
            disabled={!isNew}
            error={submitted && isNew && !idValid ? 'a–z, 0–9, _' : undefined}
            onChange={(e) => setItem((x) => ({ ...x, id: e.target.value.toLowerCase().trim() }))}
          />
          <Select
            label={t.admin.tier}
            value={item.tier}
            onChange={(e) => setItem((x) => ({ ...x, tier: e.target.value as AchievementTier }))}
            options={TIERS.map((v) => ({ value: v, label: t.achievements.tiers[v] }))}
          />
          <Input
            label={t.admin.xpBonus}
            type="number"
            min={0}
            value={item.xp_bonus}
            onChange={(e) => setItem((x) => ({ ...x, xp_bonus: Math.max(0, Number(e.target.value) || 0) }))}
          />
        </div>
        <div className={styles.grid2}>
          <Select
            label={t.admin.conditionType}
            value={item.condition_type}
            onChange={(e) => setItem((x) => ({ ...x, condition_type: e.target.value as AchievementCondition }))}
            options={CONDITIONS.map((c) => ({ value: c, label: t.admin.conditions[c] }))}
          />
          <Input
            label={t.admin.conditionValue}
            type="number"
            min={0}
            value={item.condition_value}
            onChange={(e) => setItem((x) => ({ ...x, condition_value: Math.max(0, Number(e.target.value) || 0) }))}
          />
        </div>
        <div>
          <span className={styles.sectionTitle}>{t.admin.icon}</span>
          <div className={styles.iconPicker} style={{ marginTop: 8 }}>
            {Object.keys(ACHIEVEMENT_ICONS).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={item.icon === name}
                aria-label={name}
                onClick={() => setItem((x) => ({ ...x, icon: name }))}
              >
                <AchievementIcon name={name} size={18} />
              </button>
            ))}
          </div>
        </div>
        <LanguageTabs value={lang} onChange={setLang} missing={submitted ? missing : []} />
        <Input
          label={`${t.admin.achTitle} (${lang.toUpperCase()})`}
          value={item.title[lang]}
          error={req(item.title[lang])}
          onChange={(e) => setItem((x) => ({ ...x, title: { ...x.title, [lang]: e.target.value } }))}
        />
        <Input
          label={`${t.admin.achDescription} (${lang.toUpperCase()})`}
          value={item.description[lang]}
          error={req(item.description[lang])}
          onChange={(e) => setItem((x) => ({ ...x, description: { ...x.description, [lang]: e.target.value } }))}
        />
        <Switch checked={item.is_active} onChange={(v) => setItem((x) => ({ ...x, is_active: v }))} label={t.common.active} />
      </div>
    </Modal>
  )
}
