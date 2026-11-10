import { Gauge, Layers, Lock, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, CardHeader, ConfirmDialog, ErrorState, Input, Modal, Skeleton, Switch, Table, tableStyles } from '@/components/ui'
import { PageHeader, TechIcon } from '@/components/shared'
import { testsApi } from '@/features/tests/api/testsApi'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { LANGUAGES, useI18n } from '@/locales'
import { toast } from '@/store/toastStore'
import type { AppSettings, Language, Technology } from '@/types'
import { pickLocalized } from '@/utils/localized'
import { adminApi } from '../api/adminApi'
import styles from './Admin.module.scss'
import { LanguageTabs } from './LocalizedFields'

const emptyTech = (order: number): Technology => ({
  id: '',
  name: '',
  is_core: false,
  is_active: true,
  color: '#8b5cf6',
  sort_order: order,
  description: { uz: '', ru: '', en: '' },
})

export function CategoriesManager() {
  const { t, lang } = useI18n()
  const toMessage = useErrorMessage()
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([testsApi.listTechnologies(true), testsApi.getSettings()]),
    [],
  )
  const [editing, setEditing] = useState<{ tech: Technology; isNew: boolean } | null>(null)
  const [deleting, setDeleting] = useState<Technology | null>(null)
  const [busy, setBusy] = useState(false)

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deleteTechnology(deleting.id)
      toast.success(t.admin.categoryDeleted)
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorState message={toMessage(error)} onRetry={reload} />
  const technologies = data?.[0] ?? []

  return (
    <div className="page">
      <PageHeader
        eyebrow={<><Layers /> {t.nav.admin}</>}
        title={t.admin.categoriesTitle}
        subtitle={t.admin.categoriesSubtitle}
        actions={
          <Button icon={<Plus />} onClick={() => setEditing({ tech: emptyTech(technologies.length + 1), isNew: true })}>
            {t.admin.newCategory}
          </Button>
        }
      />
      <Card>
        <CardHeader title={t.dashboard.technologies} subtitle={t.admin.coreLocked} icon={<Layers />} />
        {loading || !data ? (
          <Skeleton height={300} />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>{t.admin.technology}</th>
                <th>{t.admin.description}</th>
                <th>{t.admin.order}</th>
                <th>{t.common.status}</th>
                <th className={tableStyles.right}>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {technologies.map((tech) => (
                <tr key={tech.id}>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <TechIcon id={tech.id} color={tech.color} size={32} />
                      <span className={tableStyles.strong}>{tech.name}</span>
                      {tech.is_core && <Badge tone="primary" icon={<Lock />}>{t.admin.core}</Badge>}
                    </span>
                  </td>
                  <td>{pickLocalized(tech.description, lang)}</td>
                  <td>{tech.sort_order}</td>
                  <td>
                    <Badge tone={tech.is_active ? 'success' : 'neutral'}>{tech.is_active ? t.common.active : t.common.inactive}</Badge>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button variant="ghost" size="sm" iconOnly icon={<Pencil />} aria-label={t.common.edit} onClick={() => setEditing({ tech, isNew: false })} />
                      {!tech.is_core && (
                        <Button variant="ghost" size="sm" iconOnly icon={<Trash2 />} aria-label={t.common.delete} onClick={() => setDeleting(tech)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {data && <DifficultyXpCard settings={data[1]} onSaved={reload} />}

      {editing && (
        <TechnologyEditor
          key={editing.tech.id || 'new'}
          initial={editing.tech}
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
        description={t.admin.deleteCategoryConfirm}
        confirmLabel={t.common.delete}
        danger
        loading={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}

function TechnologyEditor({ initial, isNew, onClose, onSaved }: { initial: Technology; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const [tech, setTech] = useState<Technology>(initial)
  const [lang, setLang] = useState<Language>('uz')
  const [saving, setSaving] = useState(false)
  const [idError, setIdError] = useState<string>()

  const save = async () => {
    if (isNew && !/^[a-z0-9-]{2,24}$/.test(tech.id)) {
      setIdError(t.admin.categoryIdHint)
      return
    }
    if (!tech.name.trim()) return
    setSaving(true)
    try {
      await adminApi.saveTechnology(tech, isNew)
      toast.success(t.admin.categorySaved)
      onSaved()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      locked={saving}
      title={isNew ? t.admin.newCategory : t.admin.editCategory}
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
        <div className={styles.grid2}>
          <Input
            label={t.admin.categoryId}
            value={tech.id}
            disabled={!isNew}
            hint={isNew ? t.admin.categoryIdHint : undefined}
            error={idError}
            onChange={(e) => setTech((x) => ({ ...x, id: e.target.value.toLowerCase().trim() }))}
          />
          <Input label={t.admin.name} value={tech.name} onChange={(e) => setTech((x) => ({ ...x, name: e.target.value }))} />
        </div>
        <div className={styles.inline}>
          <Input
            label={t.admin.order}
            type="number"
            value={tech.sort_order}
            onChange={(e) => setTech((x) => ({ ...x, sort_order: Number(e.target.value) || 0 }))}
          />
          <input
            type="color"
            className={styles.colorInput}
            value={tech.color}
            aria-label={t.admin.color}
            onChange={(e) => setTech((x) => ({ ...x, color: e.target.value }))}
          />
        </div>
        <LanguageTabs value={lang} onChange={setLang} missing={LANGUAGES.filter((l) => !tech.description[l])} />
        <Input
          label={`${t.admin.description} (${lang.toUpperCase()})`}
          value={tech.description[lang] ?? ''}
          onChange={(e) => setTech((x) => ({ ...x, description: { ...x.description, [lang]: e.target.value } }))}
        />
        <Switch
          checked={tech.is_core || tech.is_active}
          disabled={tech.is_core}
          onChange={(v) => setTech((x) => ({ ...x, is_active: v }))}
          label={t.common.active}
          hint={tech.is_core ? t.admin.coreLocked : undefined}
        />
      </div>
    </Modal>
  )
}

function DifficultyXpCard({ settings, onSaved }: { settings: AppSettings; onSaved: () => void }) {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const [values, setValues] = useState({ easy_xp: settings.easy_xp, medium_xp: settings.medium_xp, hard_xp: settings.hard_xp })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await adminApi.saveSettings({ ...settings, ...values })
      toast.success(t.admin.settingsSaved)
      onSaved()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader title={t.admin.difficultyLevels} subtitle={t.admin.difficultyHint} icon={<Gauge />} />
      <div className={styles.grid3}>
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <Input
            key={d}
            type="number"
            min={0}
            max={100}
            label={`${t.tests.difficulties[d]} — XP`}
            value={values[`${d}_xp`]}
            onChange={(e) => setValues((v) => ({ ...v, [`${d}_xp`]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button icon={<Save />} loading={saving} onClick={() => void save()}>
          {t.common.save}
        </Button>
      </div>
    </Card>
  )
}
