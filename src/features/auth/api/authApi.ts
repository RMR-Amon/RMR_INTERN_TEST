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

export const authApi = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login')) throw new AppError('invalid_credentials', error.message)
      if (msg.includes('not confirmed')) throw new AppError('email_not_confirmed', error.message)
      throw toAppError(error)
    }
    return data
  },

  /** Returns the session when it was created immediately (email confirmation disabled). */
  async register({ email, password, fullName, username, language }: RegisterPayload) {
    const available = await authApi.isUsernameAvailable(username)
    if (!available) throw new AppError('username_taken')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim(), username: username.toLowerCase(), language },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw toAppError(error)
    return data.session
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
