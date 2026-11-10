import type { Dictionary } from '@/locales'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export type FieldErrors<K extends string> = Partial<Record<K, string>>

export const validateEmail = (value: string, t: Dictionary) =>
  !value.trim() ? t.validation.required : !EMAIL_RE.test(value.trim()) ? t.validation.email : undefined

export const validatePassword = (value: string, t: Dictionary) =>
  !value ? t.validation.required : value.length < 8 ? t.validation.passwordMin : undefined

export const validateUsername = (value: string, t: Dictionary) =>
  !value ? t.validation.required : !USERNAME_RE.test(value) ? t.validation.usernameFormat : undefined

export const validateFullName = (value: string, t: Dictionary) => {
  const v = value.trim()
  return !v ? t.validation.required : v.length < 2 || v.length > 60 ? t.validation.nameLength : undefined
}

export const hasErrors = (errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean)
