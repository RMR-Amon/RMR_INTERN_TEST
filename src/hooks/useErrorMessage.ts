import { useCallback } from 'react'
import { useI18n } from '@/locales'
import { toAppError } from '@/services/supabase/errors'

/** Translate any thrown error into a user-facing message. */
export const useErrorMessage = () => {
  const { t } = useI18n()
  return useCallback(
    (error: unknown) => {
      const { code } = toAppError(error)
      const messages = t.errors as Record<string, string>
      return messages[code] ?? t.errors.generic
    },
    [t],
  )
}
