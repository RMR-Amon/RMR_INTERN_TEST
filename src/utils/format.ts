import type { Language } from '@/types'

const LOCALES: Record<Language, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }

export const toLocale = (lang: Language) => LOCALES[lang]

export const formatNumber = (value: number, lang: Language) =>
  new Intl.NumberFormat(toLocale(lang)).format(value)

export const formatPercent = (value: number | null | undefined) =>
  `${Math.round(Number(value ?? 0))}%`

// ICU data for uz-UZ short months is incomplete in some browsers ("M11"),
// so Uzbek names are provided explicitly.
const UZ_MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']
const UZ_WEEKDAYS = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha']
const pad = (n: number) => String(n).padStart(2, '0')

export const formatDate = (iso: string, lang: Language, withTime = false) => {
  const d = new Date(iso)
  if (lang === 'uz') {
    const base = `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`
    return withTime ? `${base}, ${pad(d.getHours())}:${pad(d.getMinutes())}` : base
  }
  return new Intl.DateTimeFormat(toLocale(lang), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(d)
}

/** "10 noy" / "10 нояб." / "Nov 10" — compact labels for charts */
export const formatShortDate = (iso: string | Date, lang: Language) => {
  const d = new Date(iso)
  if (lang === 'uz') return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}`
  return new Intl.DateTimeFormat(toLocale(lang), { day: 'numeric', month: 'short' }).format(d)
}

export const formatWeekday = (date: Date, lang: Language) =>
  lang === 'uz' ? UZ_WEEKDAYS[date.getDay()] : new Intl.DateTimeFormat(toLocale(lang), { weekday: 'short' }).format(date)

/** 75 → "01:15" ; 3725 → "1:02:05" */
export const formatClock = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Replace {name} placeholders */
export const interpolate = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`))

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

/** Local YYYY-MM-DD key (used to group activity by day) */
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
