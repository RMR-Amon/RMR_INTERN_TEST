import { Mail, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button, Input } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { authApi } from '../api/authApi'
import { validateEmail } from '../lib/validation'
import styles from './AuthForm.module.scss'
import { FormNotice } from './FormNotice'

export function ForgotPasswordForm() {
  const { t } = useI18n()
  useDocumentTitle(t.auth.forgotTitle)
  const toMessage = useErrorMessage()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const v = validateEmail(email, t)
    setError(v)
    setFormError(null)
    if (v) return
    setLoading(true)
    try {
      await authApi.sendPasswordReset(email.trim())
      setSent(true)
    } catch (err) {
      setFormError(toMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>{t.auth.forgotTitle}</h1>
        <p className={styles.subtitle}>{t.auth.forgotSubtitle}</p>
      </div>
      {sent ? (
        <FormNotice>{t.auth.resetLinkSent}</FormNotice>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {formError && <FormNotice tone="error">{formError}</FormNotice>}
          <Input
            label={t.auth.email}
            type="email"
            autoComplete="email"
            icon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit" size="lg" fullWidth loading={loading} icon={<Send />} className={styles.submit}>
            {t.auth.sendResetLink}
          </Button>
        </form>
      )}
      <p className={styles.alt}>
        <Link to="/login" className={styles.link}>
          {t.auth.backToLogin}
        </Link>
      </p>
    </>
  )
}
