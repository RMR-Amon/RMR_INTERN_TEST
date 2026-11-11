import { Lock, LogIn, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button, Input } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { toAppError } from '@/services/supabase/errors'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '../api/authApi'
import { hasErrors, validateIdentifier, type FieldErrors } from '../lib/validation'
import styles from './AuthForm.module.scss'
import { FormNotice } from './FormNotice'

type Field = 'identifier' | 'password'

export function LoginForm() {
  const { t } = useI18n()
  useDocumentTitle(t.auth.login)
  const navigate = useNavigate()
  const location = useLocation()
  const toMessage = useErrorMessage()
  const state = location.state as { from?: string; identifier?: string } | null
  const [identifier, setIdentifier] = useState(state?.identifier ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = state?.from ?? '/'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next = {
      identifier: validateIdentifier(identifier, t),
      password: password ? undefined : t.validation.required,
    }
    setErrors(next)
    setFormError(null)
    if (hasErrors(next)) return

    setLoading(true)
    try {
      const { session } = await authApi.signIn(identifier.trim(), password)
      const profile = await useAuthStore.getState().hydrate(session)
      if (profile) navigate(from, { replace: true })
    } catch (err) {
      const { code } = toAppError(err)
      setFormError(
        code === 'invalid_credentials'
          ? t.auth.invalidCredentials
          : code === 'email_not_confirmed'
            ? t.auth.emailNotConfirmed
            : toMessage(err),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>{t.auth.loginTitle}</h1>
        <p className={styles.subtitle}>{t.auth.loginSubtitle}</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <FormNotice tone="error">{formError}</FormNotice>}
        <Input
          label={t.auth.emailOrUsername}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          icon={<UserRound />}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={errors.identifier}
          placeholder={t.auth.emailOrUsernamePlaceholder}
        />
        <Input
          label={t.auth.password}
          type="password"
          autoComplete="current-password"
          icon={<Lock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          toggleLabels={{ show: t.auth.showPassword, hide: t.auth.hidePassword }}
        />
        <div className={styles.between}>
          <Link to="/forgot-password" className={styles.link}>
            {t.auth.forgotPassword}
          </Link>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading} icon={<LogIn />} className={styles.submit}>
          {t.auth.login}
        </Button>
      </form>
      <p className={styles.alt}>
        {t.auth.noAccount}
        <Link to="/register" className={styles.link}>
          {t.auth.register}
        </Link>
      </p>
    </>
  )
}
