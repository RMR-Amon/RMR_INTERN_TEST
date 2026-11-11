import { KeyRound, Lock, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, Card, CardHeader, Input } from '@/components/ui'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { toAppError } from '@/services/supabase/errors'
import { toast } from '@/store/toastStore'
import { authApi } from '../api/authApi'
import { hasErrors, validatePassword, type FieldErrors } from '../lib/validation'
import styles from './AuthForm.module.scss'

type Field = 'current' | 'next' | 'confirm'

/** Settings card: change the password of the signed-in user. */
export function ChangePasswordForm() {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const [values, setValues] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [saving, setSaving] = useState(false)

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [field]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: FieldErrors<Field> = {
      current: values.current ? undefined : t.validation.required,
      next: validatePassword(values.next, t),
      confirm: values.confirm !== values.next ? t.validation.passwordMatch : undefined,
    }
    setErrors(next)
    if (hasErrors(next)) return

    setSaving(true)
    try {
      await authApi.changePassword(values.current, values.next)
      setValues({ current: '', next: '', confirm: '' })
      toast.success(t.settings.passwordChanged)
    } catch (err) {
      if (toAppError(err).code === 'invalid_current_password') {
        setErrors({ current: t.errors.invalid_current_password })
      } else {
        toast.error(toMessage(err))
      }
    } finally {
      setSaving(false)
    }
  }

  const toggle = { show: t.auth.showPassword, hide: t.auth.hidePassword }

  return (
    <Card>
      <CardHeader title={t.settings.password} subtitle={t.settings.passwordHint} icon={<KeyRound />} />
      <form className={styles.form} onSubmit={submit} noValidate>
        <Input
          label={t.settings.currentPassword}
          type="password"
          autoComplete="current-password"
          icon={<Lock />}
          value={values.current}
          onChange={set('current')}
          error={errors.current}
          toggleLabels={toggle}
        />
        <div className={styles.row}>
          <Input
            label={t.auth.newPassword}
            type="password"
            autoComplete="new-password"
            icon={<Lock />}
            value={values.next}
            onChange={set('next')}
            error={errors.next}
            toggleLabels={toggle}
          />
          <Input
            label={t.auth.confirmPassword}
            type="password"
            autoComplete="new-password"
            icon={<Lock />}
            value={values.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            toggleLabels={toggle}
          />
        </div>
        <div>
          <Button type="submit" icon={<Save />} loading={saving}>
            {t.settings.changePassword}
          </Button>
        </div>
      </form>
    </Card>
  )
}
