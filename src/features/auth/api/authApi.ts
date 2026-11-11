import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase/client'
import { AppError, toAppError, unwrap } from '@/services/supabase/errors'
import type { Language } from '@/types'

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  username: string
  language: Language
}

/** Call the `signup` Edge Function and turn its `{ error }` body into an AppError. */
const callSignup = async (body: Record<string, unknown>) => {
  const { error } = await supabase.functions.invoke('signup', { body })
  if (!error) return
  if (error instanceof FunctionsHttpError) {
    const payload = (await error.context.json().catch(() => null)) as { error?: string } | null
    throw new AppError(payload?.error ?? 'generic', error.message)
  }
  throw toAppError(error)
}

export const authApi = {
  /** `identifier` is an email (contains "@") or a username. */
  async signIn(identifier: string, password: string) {
    let email = identifier.trim()
    if (!email.includes('@')) {
      const resolved = unwrap(
        await supabase.rpc('resolve_login_email', { p_username: email.toLowerCase(), p_password: password }),
      ) as string | null
      if (!resolved) throw new AppError('invalid_credentials')
      email = resolved
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login')) throw new AppError('invalid_credentials', error.message)
      if (msg.includes('not confirmed')) throw new AppError('email_not_confirmed', error.message)
      throw toAppError(error)
    }
    return data
  },

  /** Step 1 of sign-up: email a 6-digit code (also checks email / username are free). */
  async sendSignupCode(email: string, username: string, language: Language) {
    await callSignup({ action: 'send', email: email.trim(), username: username.toLowerCase(), language })
  },

  /** Step 2 of sign-up: verify the code and create the (already confirmed) account. No session is created. */
  async completeSignup({ code, email, password, fullName, username, language }: RegisterPayload & { code: string }) {
    await callSignup({
      action: 'verify',
      code,
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      username: username.toLowerCase(),
      language,
    })
  },

  async isUsernameAvailable(username: string) {
    return unwrap(
      await supabase.rpc('is_username_available', { p_username: username.toLowerCase() }),
    ) as boolean
  },

  async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw toAppError(error)
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw toAppError(error)
  },

  async signOut() {
    await supabase.auth.signOut()
  },
}
