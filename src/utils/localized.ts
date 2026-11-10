import type { Language, Localized } from '@/types'

/** Pick the text for the active language with sensible fallbacks. */
export const pickLocalized = (value: Partial<Localized> | null | undefined, lang: Language): string =>
  value?.[lang] || value?.en || value?.uz || value?.ru || ''

export const emptyLocalized = (): Localized => ({ uz: '', ru: '', en: '' })
