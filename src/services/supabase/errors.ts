/** Normalised application error with a stable code for translation. */
export class AppError extends Error {
  readonly code: string

  constructor(code: string, message?: string) {
    super(message ?? code)
    this.code = code
    this.name = 'AppError'
  }
}

const KNOWN_CODES = [
  'not_authenticated',
  'account_blocked',
  'invalid_difficulty',
  'invalid_question_count',
  'invalid_duration',
  'not_enough_questions',
  'session_not_found',
  'session_closed',
  'session_abandoned',
  'session_not_submitted',
  'time_expired',
  'invalid_option',
  'forbidden',
  'cannot_demote_self',
  'invalid_amount',
  'user_not_found',
  'too_many_attempts',
] as const

/** Codes returned by the `signup` Edge Function (passed through as-is). */
export type SignupErrorCode =
  | 'email_taken'
  | 'code_invalid'
  | 'code_expired'
  | 'code_attempts'
  | 'code_cooldown'
  | 'too_many_codes'
  | 'email_send_failed'
  | 'weak_password'

export type KnownErrorCode =
  | (typeof KNOWN_CODES)[number]
  | SignupErrorCode
  | 'network'
  | 'username_taken'
  | 'generic'

interface PostgrestLikeError {
  message?: string
  code?: string
  details?: string | null
}

/** Convert Supabase / Postgres errors into AppError with a known code. */
export const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) return error
  const e = (error ?? {}) as PostgrestLikeError
  const message = e.message ?? String(error)

  const known = KNOWN_CODES.find((code) => message.includes(code))
  if (known) return new AppError(known, message)
  if (e.code === '23505' && message.includes('username')) return new AppError('username_taken', message)
  if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('network')) {
    return new AppError('network', message)
  }
  return new AppError('generic', message)
}

/** Throw if a Supabase response contains an error, otherwise return data. */
export const unwrap = <T>(response: { data: T | null; error: unknown }): T => {
  if (response.error) throw toAppError(response.error)
  return response.data as T
}
