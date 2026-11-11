import { ArrowLeft, Award, History, Mail, RotateCcw, Save, ShieldAlert, Trash2, UserCog, Zap } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Badge, Button, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Input, LinkButton, Modal, Select, SkeletonCard, Switch, Table, tableStyles } from '@/components/ui'
import { AchievementIcon } from '@/components/shared'
import { achievementsApi } from '@/features/achievements/api/achievementsApi'
import { USERNAME_MAX, validateFullName, validateUsername } from '@/features/auth/lib/validation'
import { ProfileHero } from '@/features/profile/components/ProfileHero'
import { TestCardList } from '@/features/tests/components/TestCard/TestCard'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { leaderboardApi } from '@/features/leaderboard/api/leaderboardApi'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import type { Profile, Role } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'
import { pickLocalized } from '@/utils/localized'
import { adminApi } from '../api/adminApi'
import styles from './Admin.module.scss'

export function StudentDetail({ userId }: { userId: string }) {
  const { t, f, lang } = useI18n()
  const toMessage = useErrorMessage()
  const me = useAuthStore((s) => s.profile)
  const refreshMe = useAuthStore((s) => s.refreshProfile)

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        adminApi.getStudent(userId),
        adminApi.listSessions(0, 20, userId),
        adminApi.xpLog(userId),
        achievementsApi.list(true),
        achievementsApi.listEarned(userId),
        leaderboardApi.getRank(userId),
        // Email lookup is optional: don't break the page if it fails
        adminApi.getEmail(userId).catch(() => null),
      ]),
    [userId],
  )

  const [xpOpen, setXpOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  if (error) return <ErrorState message={toMessage(error)} onRetry={reload} />
  if (loading || !data) return <SkeletonCard lines={6} height={360} />

  const [student, sessions, xpLog, achievements, earned, rank, email] = data
  if (!student) return <EmptyState title={t.admin.studentNotFound} action={<LinkButton to="/admin/students">{t.common.back}</LinkButton>} />

  const earnedIds = new Set(earned.map((e) => e.achievement_id))

  const afterChange = async () => {
    reload()
    if (student.id === me?.id) await refreshMe()
  }

  const toggleAchievement = async (id: string) => {
    try {
      if (earnedIds.has(id)) {
        await adminApi.revokeAchievement(student.id, id)
        toast.success(t.admin.revoked)
      } else {
        await adminApi.grantAchievement(student.id, id)
        toast.success(t.admin.granted)
      }
      reload()
    } catch (err) {
      toast.error(toMessage(err))
    }
  }

  const resetProgress = async () => {
    setBusy(true)
    try {
      await adminApi.resetProgress(student.id)
      toast.success(t.admin.progressReset)
      setResetOpen(false)
      await afterChange()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const deleteUser = async () => {
    setBusy(true)
    try {
      await adminApi.deleteUser(student.id)
      toast.success(t.admin.userDeleted)
      setDeleteOpen(false)
      navigate('/admin/students', { replace: true })
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const isSelf = student.id === me?.id

  return (
    <div className="page">
      <div>
        <LinkButton to="/admin/students" variant="ghost" size="sm" icon={<ArrowLeft />}>
          {t.admin.studentsTitle}
        </LinkButton>
      </div>
      <ProfileHero profile={student} rank={rank} />

      <div className="page-grid">
        <div className="stack">
          <Card>
            <CardHeader title={t.nav.history} icon={<History />} />
            {sessions.rows.length === 0 ? <EmptyState title={t.history.empty} /> : <TestCardList sessions={sessions.rows.filter((s) => s.status === 'submitted')} />}
          </Card>

          <Card>
            <CardHeader title={t.admin.xpLog} icon={<Zap />} />
            {xpLog.length === 0 ? (
              <EmptyState title={t.common.noData} />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>{t.history.date}</th>
                    <th>{t.admin.note}</th>
                    <th className={tableStyles.right}>XP</th>
                  </tr>
                </thead>
                <tbody>
                  {xpLog.map((e) => (
                    <tr key={e.id}>
                      <td>{formatDate(e.created_at, lang, true)}</td>
                      <td>
                        <Badge tone={e.reason === 'admin' ? 'secondary' : e.reason === 'achievement' ? 'warning' : 'primary'}>
                          {t.admin.reasons[e.reason]}
                        </Badge>{' '}
                        {e.note}
                      </td>
                      <td className={cn(tableStyles.right, e.amount >= 0 ? styles.xpPositive : styles.xpNegative)}>
                        {e.amount > 0 ? '+' : ''}
                        {e.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>

        <div className="stack">
          <StudentEditForm
            key={`${student.id}-${student.full_name}-${student.username}-${student.role}-${student.is_blocked}`}
            student={student} email={email} isSelf={isSelf} onSaved={afterChange} />

          <Card>
            <CardHeader title={t.admin.adjustXp} icon={<Zap />} />
            <div className={styles.danger}>
              <Button variant="outline" icon={<Zap />} onClick={() => setXpOpen(true)}>
                {t.admin.adjustXp}
              </Button>
              <Button variant="ghost" icon={<RotateCcw />} onClick={() => setResetOpen(true)}>
                {t.admin.resetProgress}
              </Button>
              {!isSelf && (
                <Button variant="danger" icon={<Trash2 />} onClick={() => setDeleteOpen(true)}>
                  {t.admin.deleteUser}
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={t.admin.grantAchievement} icon={<Award />} />
            <div className={styles.list}>
              {achievements.map((a) => (
                <div key={a.id} className={styles.achRow}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AchievementIcon name={a.icon} size={18} />
                    {pickLocalized(a.title, lang)}
                  </span>
                  <Button size="sm" variant={earnedIds.has(a.id) ? 'ghost' : 'secondary'} onClick={() => void toggleAchievement(a.id)}>
                    {earnedIds.has(a.id) ? t.admin.revoke : t.admin.grantAchievement}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AdjustXpModal
        open={xpOpen}
        onClose={() => setXpOpen(false)}
        onDone={async (xp) => {
          toast.success(f(t.admin.xpAdjusted, { xp }))
          setXpOpen(false)
          await afterChange()
        }}
        userId={student.id}
      />

      <ConfirmDialog
        open={resetOpen}
        title={t.admin.resetProgress}
        description={t.admin.resetConfirm}
        confirmLabel={t.admin.resetProgress}
        danger
        loading={busy}
        onConfirm={() => void resetProgress()}
        onClose={() => setResetOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={t.admin.deleteUser}
        description={t.admin.deleteUserConfirm}
        confirmLabel={t.admin.deleteUser}
        danger
        loading={busy}
        onConfirm={() => void deleteUser()}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}

function StudentEditForm({ student, email, isSelf, onSaved }: { student: Profile; email: string | null; isSelf: boolean; onSaved: () => Promise<void> }) {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const [fullName, setFullName] = useState(student.full_name)
  const [username, setUsername] = useState(student.username)
  const [role, setRole] = useState<Role>(student.role)
  const [blocked, setBlocked] = useState(student.is_blocked)
  const [errors, setErrors] = useState<{ fullName?: string; username?: string }>({})
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { fullName: validateFullName(fullName, t), username: validateUsername(username, t) }
    setErrors(next)
    if (next.fullName || next.username) return
    setSaving(true)
    try {
      await adminApi.updateStudent(student.id, { full_name: fullName, username, role, is_blocked: blocked })
      toast.success(t.admin.studentUpdated)
      await onSaved()
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader title={t.admin.editStudent} icon={<UserCog />} />
      <form className={styles.form} onSubmit={submit} noValidate>
        {email && <Input label={t.auth.email} icon={<Mail />} value={email} readOnly />}
        <Input label={t.auth.fullName} value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />
        <Input
          label={t.auth.username}
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
          maxLength={USERNAME_MAX}
          error={errors.username}
        />
        <Select
          label={t.admin.role}
          value={role}
          disabled={isSelf}
          onChange={(e) => setRole(e.target.value as Role)}
          options={[
            { value: 'student', label: t.profile.role.student },
            { value: 'admin', label: t.profile.role.admin },
          ]}
        />
        <Switch
          checked={blocked}
          onChange={setBlocked}
          disabled={isSelf}
          label={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={15} /> {t.admin.blockedLabel}
            </span>
          }
        />
        <Button type="submit" icon={<Save />} loading={saving}>
          {t.common.save}
        </Button>
      </form>
    </Card>
  )
}

function AdjustXpModal({ open, onClose, onDone, userId }: { open: boolean; onClose: () => void; onDone: (xp: number) => Promise<void>; userId: string }) {
  const { t, f } = useI18n()
  const toMessage = useErrorMessage()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const value = Number(amount)
    if (!Number.isInteger(value) || value === 0 || Math.abs(value) > 100000) {
      setError(f(t.validation.numberRange, { min: -100000, max: 100000 }))
      return
    }
    setSaving(true)
    try {
      const xp = await adminApi.adjustXp(userId, value, note)
      setAmount('')
      setNote('')
      setError(undefined)
      await onDone(xp)
    } catch (err) {
      toast.error(toMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.admin.adjustXp}
      size="sm"
      locked={saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button onClick={() => void submit()} loading={saving}>
            {t.common.save}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input label={t.admin.xpAmount} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} error={error} data-autofocus />
        <Input label={t.admin.note} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
      </div>
    </Modal>
  )
}
