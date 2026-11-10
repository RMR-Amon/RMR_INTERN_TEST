import { FileQuestion, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, Pagination, Select, Skeleton, Table, tableStyles } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { testsApi } from '@/features/tests/api/testsApi'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { toast } from '@/store/toastStore'
import type { Difficulty, Question } from '@/types'
import { pickLocalized } from '@/utils/localized'
import { techColor, techName } from '@/utils/technology'
import { adminApi } from '../api/adminApi'
import styles from './Admin.module.scss'
import { QuestionEditor } from './QuestionEditor'

const PAGE_SIZE = 20

export function QuestionsManager() {
  const { t, f, lang } = useI18n()
  const toMessage = useErrorMessage()
  const [search, setSearch] = useState('')
  const [technology, setTechnology] = useState('all')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [page, setPage] = useState(0)
  const debounced = useDebounce(search, 300)

  const [editing, setEditing] = useState<Question | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [deleting, setDeleting] = useState<Question | null>(null)
  const [busy, setBusy] = useState(false)

  const meta = useAsync(() => Promise.all([testsApi.listTechnologies(true), testsApi.getSettings()]), [])
  const technologies = meta.data?.[0] ?? []
  const { data, loading, error, reload } = useAsync(
    () => adminApi.listQuestions({ search: debounced, technology, difficulty, page, pageSize: PAGE_SIZE }),
    [debounced, technology, difficulty, page],
  )

  const openEditor = (q: Question | null) => {
    setEditing(q)
    setEditorOpen(true)
  }

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deleteQuestion(deleting.id)
      toast.success(t.admin.questionDeleted)
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
        eyebrow={<><FileQuestion /> {t.nav.admin}</>}
        title={t.admin.questionsTitle}
        subtitle={data ? f(t.admin.questionsSubtitle, { count: data.total }) : undefined}
        actions={
          <Button icon={<Plus />} onClick={() => openEditor(null)} disabled={technologies.length === 0}>
            {t.admin.newQuestion}
          </Button>
        }
      />
      <Card>
        <div className={styles.toolbar}>
          <Input
            icon={<Search />}
            placeholder={t.admin.searchQuestions}
            aria-label={t.admin.searchQuestions}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />
          <Select
            wrapperClassName={styles.filter}
            aria-label={t.admin.technology}
            value={technology}
            onChange={(e) => {
              setTechnology(e.target.value)
              setPage(0)
            }}
            options={[{ value: 'all', label: t.common.all }, ...technologies.map((x) => ({ value: x.id, label: x.name }))]}
          />
          <Select
            wrapperClassName={styles.filter}
            aria-label={t.admin.difficulty}
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value as Difficulty | 'all')
              setPage(0)
            }}
            options={[
              { value: 'all', label: t.common.all },
              ...(['easy', 'medium', 'hard'] as const).map((d) => ({ value: d, label: t.tests.difficulties[d] })),
            ]}
          />
        </div>

        {error ? (
          <ErrorState message={toMessage(error)} onRetry={reload} />
        ) : loading && !data ? (
          <Skeleton height={360} />
        ) : !data || data.rows.length === 0 ? (
          <EmptyState title={t.common.noData} />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t.admin.questionText}</th>
                  <th>{t.admin.technology}</th>
                  <th>{t.admin.difficulty}</th>
                  <th className={tableStyles.right}>XP</th>
                  <th>{t.common.status}</th>
                  <th className={tableStyles.right}>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((q) => (
                  <tr key={q.id}>
                    <td className={styles.mono}>{q.id}</td>
                    <td>
                      <span className={styles.questionCell}>{pickLocalized(q.question, lang)}</span>
                    </td>
                    <td>
                      <Badge color={techColor(q.technology, technologies)}>{techName(q.technology, technologies)}</Badge>
                    </td>
                    <td>
                      <Badge tone={q.difficulty}>{t.tests.difficulties[q.difficulty]}</Badge>
                    </td>
                    <td className={tableStyles.right}>{q.xp_reward}</td>
                    <td>
                      <Badge tone={q.is_active ? 'success' : 'neutral'}>{q.is_active ? t.common.active : t.common.inactive}</Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Button variant="ghost" size="sm" iconOnly icon={<Pencil />} onClick={() => openEditor(q)} aria-label={t.common.edit} />
                        <Button variant="ghost" size="sm" iconOnly icon={<Trash2 />} onClick={() => setDeleting(q)} aria-label={t.common.delete} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onChange={setPage} />
          </>
        )}
      </Card>

      <QuestionEditor
        open={editorOpen}
        question={editing}
        technologies={technologies}
        settings={meta.data?.[1]}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          setEditorOpen(false)
          reload()
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t.admin.deleteQuestion}
        description={t.admin.deleteQuestionConfirm}
        confirmLabel={t.common.delete}
        danger
        loading={busy}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
