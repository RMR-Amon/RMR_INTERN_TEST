import { KeyRound, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Input, Spinner } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { authApi } from '../api/authApi'
import { validatePassword } from '../lib/validation'
import styles from './AuthForm.module.scss'
import { FormNotice } from './FormNotice'

/**
 * Opened from the recovery email. Supabase exchanges the token in the URL
 * for a session (detectSessionInUrl), after which the password can be updated.
 */
export function ResetPasswordForm() {
  const { t } = useI18n()
  useDocumentTitle(t.auth.resetTitle)
  const navigate = useNavigate()
  const toMessage = useErrorMessage()
  const status = useAuthStore((s) => s.status)
  const session = useAuthStore((s) => s.session)
  const clearRecovery = useAuthStore((s) => s.clearRecovery)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (status === 'loading') return <Spinner />

  if (!session) {
    return (
      <>
        <div className={styles.head}>
          <h1 className={styles.title}>{t.auth.resetTitle}</h1>
        </div>
        <FormNotice tone="error">{t.auth.invalidLink}</FormNotice>
        <p className={styles.alt}>
          <Link to="/forgot-password" className={styles.link}>
            {t.auth.forgotTitle}
          </Link>
        </p>
      </>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next = {
      password: validatePassword(password, t),
      confirm: confirm !== password ? t.validation.passwordMatch : undefined,
    }
    setErrors(next)
    setFormError(null)
    if (next.password || next.confirm) return
    setLoading(true)
    try {
      await authApi.updatePassword(password)
      clearRecovery()
      toast.success(t.auth.passwordUpdated)
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(toMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>{t.auth.resetTitle}</h1>
        <p className={styles.subtitle}>{t.auth.resetSubtitle}</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <FormNotice tone="error">{formError}</FormNotice>}
        <Input
          label={t.auth.newPassword}
          type="password"
          autoComplete="new-password"
          icon={<Lock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          toggleLabels={{ show: t.auth.showPassword, hide: t.auth.hidePassword }}
        />
        <Input
          label={t.auth.confirmPassword}
          type="password"
          autoComplete="new-password"
          icon={<Lock />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          toggleLabels={{ show: t.auth.showPassword, hide: t.auth.hidePassword }}
        />
        <Button type="submit" size="lg" fullWidth loading={loading} icon={<KeyRound />} className={styles.submit}>
          {t.auth.updatePassword}
        </Button>
      </form>
    </>
  )
}
