import { Save } from 'lucide-react'
import { useState } from 'react'
import { Button, Input, Modal, Select, Switch, Textarea } from '@/components/ui'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { LANGUAGES, useI18n } from '@/locales'
import { toast } from '@/store/toastStore'
import type { AppSettings, Difficulty, Language, Localized, Question, QuestionInput, Technology } from '@/types'
import { emptyLocalized } from '@/utils/localized'
import { adminApi } from '../api/adminApi'
import styles from './Admin.module.scss'
import { LanguageTabs } from './LocalizedFields'

interface QuestionEditorProps {
  open: boolean
  question: Question | null
  technologies: Technology[]
  settings: AppSettings | undefined
  onClose: () => void
  onSaved: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

const blank = (tech: string, settings?: AppSettings): QuestionInput => ({
  technology: tech,
  difficulty: 'medium',
  question: emptyLocalized(),
  code: '',
  options: [emptyLocalized(), emptyLocalized(), emptyLocalized(), emptyLocalized()],
  correct_index: 0,
  explanation: emptyLocalized(),
  xp_reward: settings?.medium_xp ?? 15,
  is_active: true,
})

const missingLanguages = (q: QuestionInput): Language[] =>
  LANGUAGES.filter(
    (l) => !q.question[l].trim() || !q.explanation[l].trim() || q.options.some((o) => !o[l].trim()),
  )

/** Create / edit a question in all three languages. */
export function QuestionEditor(props: QuestionEditorProps) {
  // Re-mount the form for each question so its state starts fresh
  return props.open ? <QuestionEditorForm key={props.question?.id ?? 'new'} {...props} /> : <Modal open={false} onClose={props.onClose} title="" />
}

function QuestionEditorForm({ open, question, technologies, settings, onClose, onSaved }: QuestionEditorProps) {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const [form, setForm] = useState<QuestionInput>(() =>
    question ? { ...question, code: question.code ?? '' } : blank(technologies[0]?.id ?? 'html', settings),
  )
  const [lang, setLang] = useState<Language>('uz')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const missing = missingLanguages(form)
  const xpByDifficulty = (d: Difficulty) =>
    d === 'easy' ? settings?.easy_xp ?? 10 : d === 'hard' ? settings?.hard_xp ?? 20 : settings?.medium_xp ?? 15

  const setLocalized = (field: 'question' | 'explanation', value: string) =>
    setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: value } as Localized }))

  const setOption = (index: number, value: string) =>
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === index ? { ...o, [lang]: value } : o)) }))

  const save = async () => {
    setSubmitted(true)
    if (missing.length > 0) {
      setLang(missing[0])
      toast.warning(t.validation.fourOptions)
      return
    }
    setSaving(true)
    try {
      await adminApi.saveQuestion(form)
      toast.success(t.admin.questionSaved)
      onSaved()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const err = (value: string) => (submitted && !value.trim() ? t.validation.required : undefined)

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      locked={saving}
      title={question ? t.admin.editQuestion : t.admin.newQuestion}
      description={question?.id}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button icon={<Save />} onClick={() => void save()} loading={saving}>
            {t.common.save}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.grid3}>
          <Select
            label={t.admin.technology}
            value={form.technology}
            onChange={(e) => setForm((f) => ({ ...f, technology: e.target.value }))}
            options={technologies.map((x) => ({ value: x.id, label: x.name }))}
          />
          <Select
            label={t.admin.difficulty}
            value={form.difficulty}
            onChange={(e) => {
              const difficulty = e.target.value as Difficulty
              setForm((f) => ({ ...f, difficulty, xp_reward: xpByDifficulty(difficulty) }))
            }}
            options={(['easy', 'medium', 'hard'] as const).map((d) => ({ value: d, label: t.tests.difficulties[d] }))}
          />
          <Input
            label={t.admin.xpReward}
            type="number"
            min={0}
            max={100}
            value={form.xp_reward}
            onChange={(e) => setForm((f) => ({ ...f, xp_reward: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}
          />
        </div>

        <LanguageTabs value={lang} onChange={setLang} missing={submitted ? missing : []} />

        <Textarea
          label={`${t.admin.questionText} (${lang.toUpperCase()})`}
          value={form.question[lang]}
          onChange={(e) => setLocalized('question', e.target.value)}
          error={err(form.question[lang])}
          rows={3}
        />
        <Textarea
          label={t.admin.code}
          mono
          rows={4}
          value={form.code ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          spellCheck={false}
        />

        <span className={styles.sectionTitle}>{t.admin.correctOption}</span>
        <div className={styles.options} role="radiogroup" aria-label={t.admin.correctOption}>
          {form.options.map((option, i) => (
            <div key={i} className={styles.optionRow}>
              <button
                type="button"
                role="radio"
                aria-checked={form.correct_index === i}
                className={styles.correctPick}
                onClick={() => setForm((f) => ({ ...f, correct_index: i }))}
                title={t.admin.correctOption}
              >
                {LETTERS[i]}
              </button>
              <Input
                label={t.admin.option.replace('{n}', String(i + 1))}
                value={option[lang]}
                onChange={(e) => setOption(i, e.target.value)}
                error={err(option[lang])}
              />
            </div>
          ))}
        </div>

        <Textarea
          label={`${t.admin.explanation} (${lang.toUpperCase()})`}
          value={form.explanation[lang]}
          onChange={(e) => setLocalized('explanation', e.target.value)}
          error={err(form.explanation[lang])}
          rows={3}
        />
        <Switch checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label={t.admin.isActive} />
      </div>
    </Modal>
  )
}
