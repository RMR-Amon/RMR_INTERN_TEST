import { AtSign, Lock, Mail, User, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Input } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { toAppError } from '@/services/supabase/errors'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { authApi } from '../api/authApi'
import {
  hasErrors,
  validateEmail,
  validateFullName,
  validatePassword,
  validateUsername,
  type FieldErrors,
} from '../lib/validation'
import styles from './AuthForm.module.scss'
import { FormNotice } from './FormNotice'

type Field = 'fullName' | 'username' | 'email' | 'password' | 'confirm'

export function RegisterForm() {
  const { t, lang } = useI18n()
  useDocumentTitle(t.auth.register)
  const navigate = useNavigate()
  const toMessage = useErrorMessage()
  const [values, setValues] = useState({ fullName: '', username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'username' ? e.target.value.toLowerCase().replace(/\s/g, '') : e.target.value
    setValues((v) => ({ ...v, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next: FieldErrors<Field> = {
      fullName: validateFullName(values.fullName, t),
      username: validateUsername(values.username, t),
      email: validateEmail(values.email, t),
      password: validatePassword(values.password, t),
      confirm: values.confirm !== values.password ? t.validation.passwordMatch : undefined,
    }
    setErrors(next)
    setFormError(null)
    if (hasErrors(next)) return

    setLoading(true)
    try {
      const session = await authApi.register({
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName,
        username: values.username,
        language: lang,
      })
      if (session) {
        await useAuthStore.getState().hydrate(session)
        toast.success(t.auth.registered)
        navigate('/', { replace: true })
      } else {
        setNeedsConfirmation(true)
      }
    } catch (err) {
      const { code } = toAppError(err)
      if (code === 'username_taken') setErrors((prev) => ({ ...prev, username: t.validation.usernameTaken }))
      else setFormError(toMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (needsConfirmation) {
    return (
      <>
        <div className={styles.head}>
          <h1 className={styles.title}>{t.auth.registerTitle}</h1>
        </div>
        <FormNotice>{t.auth.checkEmail}</FormNotice>
        <p className={styles.alt}>
          <Link to="/login" className={styles.link}>
            {t.auth.backToLogin}
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>{t.auth.registerTitle}</h1>
        <p className={styles.subtitle}>{t.auth.registerSubtitle}</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <FormNotice tone="error">{formError}</FormNotice>}
        <Input
          label={t.auth.fullName}
          autoComplete="name"
          icon={<User />}
          value={values.fullName}
          onChange={set('fullName')}
          error={errors.fullName}
          maxLength={60}
        />
        <Input
          label={t.auth.username}
          autoComplete="username"
          icon={<AtSign />}
          value={values.username}
          onChange={set('username')}
          error={errors.username}
          hint={t.auth.usernameHint}
          maxLength={20}
        />
        <Input
          label={t.auth.email}
          type="email"
          autoComplete="email"
          icon={<Mail />}
          value={values.email}
          onChange={set('email')}
          error={errors.email}
        />
        <div className={styles.row}>
          <Input
            label={t.auth.password}
            type="password"
            autoComplete="new-password"
            icon={<Lock />}
            value={values.password}
            onChange={set('password')}
            error={errors.password}
            toggleLabels={{ show: t.auth.showPassword, hide: t.auth.hidePassword }}
          />
          <Input
            label={t.auth.confirmPassword}
            type="password"
            autoComplete="new-password"
            icon={<Lock />}
            value={values.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            toggleLabels={{ show: t.auth.showPassword, hide: t.auth.hidePassword }}
          />
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading} icon={<UserPlus />} className={styles.submit}>
          {t.auth.register}
        </Button>
      </form>
      <p className={styles.alt}>
        {t.auth.haveAccount}
        <Link to="/login" className={styles.link}>
          {t.auth.login}
        </Link>
      </p>
    </>
  )
}
