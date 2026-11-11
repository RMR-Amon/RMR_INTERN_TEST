import type { Dictionary } from '@/locales'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** 3–30 characters, anything except whitespace and "@" ("@" marks an email on the login form). */
export const USERNAME_RE = /^[^\s@]{3,30}$/u
export const USERNAME_MAX = 30
/** Supabase Auth's own minimum; no other password rules. */
export const PASSWORD_MIN = 6

export type FieldErrors<K extends string> = Partial<Record<K, string>>

export const validateEmail = (value: string, t: Dictionary) =>
  !value.trim() ? t.validation.required : !EMAIL_RE.test(value.trim()) ? t.validation.email : undefined

export const validatePassword = (value: string, t: Dictionary) =>
  !value ? t.validation.required : value.length < PASSWORD_MIN ? t.validation.passwordMin : undefined

export const validateUsername = (value: string, t: Dictionary) =>
  !value ? t.validation.required : !USERNAME_RE.test(value) ? t.validation.usernameFormat : undefined

/** Login field: either an email or a username. */
export const validateIdentifier = (value: string, t: Dictionary) => {
  const v = value.trim()
  if (!v) return t.validation.required
  return v.includes('@') ? validateEmail(v, t) : undefined
}

export const validateFullName = (value: string, t: Dictionary) => {
  const v = value.trim()
  return !v ? t.validation.required : v.length < 2 || v.length > 60 ? t.validation.nameLength : undefined
}

export const hasErrors = (errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean)
