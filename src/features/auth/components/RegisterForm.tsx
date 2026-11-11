import { ArrowLeft, AtSign, KeyRound, Lock, Mail, RotateCw, User, UserPlus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Input } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { toAppError } from '@/services/supabase/errors'
import { toast } from '@/store/toastStore'
import { authApi } from '../api/authApi'
import {
  hasErrors,
  USERNAME_MAX,
  validateEmail,
  validateFullName,
  validatePassword,
  validateUsername,
  type FieldErrors,
} from '../lib/validation'
import styles from './AuthForm.module.scss'
import { FormNotice } from './FormNotice'

type Field = 'fullName' | 'username' | 'email' | 'password' | 'confirm'

const RESEND_SECONDS = 60

export function RegisterForm() {
  const { t, f, lang } = useI18n()
  useDocumentTitle(t.auth.register)
  const navigate = useNavigate()
  const toMessage = useErrorMessage()
  const [values, setValues] = useState({ fullName: '', username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [step, setStep] = useState<'details' | 'code'>('details')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (resendIn <= 0) return
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [resendIn])

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'username' ? e.target.value.toLowerCase().replace(/\s/g, '') : e.target.value
    setValues((v) => ({ ...v, [field]: value }))
  }

  /** Map sign-up error codes onto the right field; returns false if it is a form-level error. */
  const applyFieldError = (code: string) => {
    if (code === 'username_taken') setErrors((prev) => ({ ...prev, username: t.validation.usernameTaken }))
    else if (code === 'email_taken') setErrors((prev) => ({ ...prev, email: t.validation.emailTaken }))
    else return false
    return true
  }

  const handleDetails = async (e: FormEvent) => {
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
      await authApi.sendSignupCode(values.email, values.username, lang)
      setCode('')
      setCodeError(null)
      setResendIn(RESEND_SECONDS)
      setStep('code')
    } catch (err) {
      const { code: c } = toAppError(err)
      if (c === 'code_cooldown') {
        // A code was sent moments ago — let the user enter it
        setStep('code')
      } else if (!applyFieldError(c)) {
        setFormError(toMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setCodeError(null)
    try {
      await authApi.sendSignupCode(values.email, values.username, lang)
      setCode('')
      setResendIn(RESEND_SECONDS)
      toast.success(t.auth.codeResent)
    } catch (err) {
      const { code: c } = toAppError(err)
      if (c === 'code_cooldown') setResendIn(RESEND_SECONDS)
      setCodeError(toMessage(err))
    } finally {
      setResending(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setCodeError(t.validation.codeFormat)
      return
    }
    setLoading(true)
    setCodeError(null)
    try {
      await authApi.completeSignup({
        code,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        username: values.username,
        language: lang,
      })
      toast.success(t.auth.registeredLogin)
      navigate('/login', { replace: true, state: { identifier: values.username } })
    } catch (err) {
      const { code: c } = toAppError(err)
      if (applyFieldError(c)) {
        // Username / email got taken meanwhile — back to the details step
        setStep('details')
      } else {
        setCodeError(toMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <>
        <div className={styles.head}>
          <h1 className={styles.title}>{t.auth.verifyTitle}</h1>
          <p className={styles.subtitle}>{f(t.auth.verifySubtitle, { email: values.email.trim() })}</p>
        </div>
        <form className={styles.form} onSubmit={handleVerify} noValidate>
          {codeError && <FormNotice tone="error">{codeError}</FormNotice>}
          <Input
            label={t.auth.verificationCode}
            icon={<KeyRound />}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={styles.code}
          />
          <Button type="submit" size="lg" fullWidth loading={loading} icon={<UserPlus />} className={styles.submit}>
            {t.auth.confirmAndRegister}
          </Button>
          <div className={styles.codeActions}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft />} onClick={() => setStep('details')}>
              {t.auth.changeDetails}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCw />}
              loading={resending}
              disabled={resendIn > 0}
              onClick={handleResend}
            >
              {resendIn > 0 ? f(t.auth.resendIn, { seconds: resendIn }) : t.auth.resendCode}
            </Button>
          </div>
        </form>
      </>
    )
  }

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>{t.auth.registerTitle}</h1>
        <p className={styles.subtitle}>{t.auth.registerSubtitle}</p>
      </div>
      <form className={styles.form} onSubmit={handleDetails} noValidate>
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
          autoCapitalize="none"
          spellCheck={false}
          icon={<AtSign />}
          value={values.username}
          onChange={set('username')}
          error={errors.username}
          hint={t.auth.usernameHint}
          maxLength={USERNAME_MAX}
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
        <Button type="submit" size="lg" fullWidth loading={loading} icon={<Mail />} className={styles.submit}>
          {t.auth.sendCode}
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
