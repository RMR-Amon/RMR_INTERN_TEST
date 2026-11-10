import { useCallback } from 'react'
import { usePreferencesStore } from '@/store/preferencesStore'
import type { Language } from '@/types'
import { interpolate } from '@/utils/format'
import { en, type Dictionary } from './en'
import { ru } from './ru'
import { uz } from './uz'

export const dictionaries: Record<Language, Dictionary> = { uz, ru, en }
export const LANGUAGES: Language[] = ['uz', 'ru', 'en']
export const DEFAULT_LANGUAGE: Language = 'uz'

export type { Dictionary }

/**
 * Centralised localisation hook.
 *   const { t, lang, f } = useI18n()
 *   t.dashboard.startTest
 *   f(t.tests.questionOf, { current: 1, total: 10 })
 * Switching language re-renders instantly — no page reload.
 */
export const useI18n = () => {
  const lang = usePreferencesStore((s) => s.language)
  const t = dictionaries[lang]
  const f = useCallback(
    (template: string, vars: Record<string, string | number>) => interpolate(template, vars),
    [],
  )
  return { t, lang, f }
}

/** Non-hook access (stores, services) */
export const getDictionary = (): Dictionary => dictionaries[usePreferencesStore.getState().language]
