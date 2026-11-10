import { supabase } from '@/services/supabase/client'
import { AppError, unwrap } from '@/services/supabase/errors'
import type { Language, Profile, TestSessionSummary } from '@/types'

export const PROFILE_COLUMNS =
  'id, username, full_name, avatar_url, role, is_blocked, xp, level, tests_completed, average_score, best_score, current_streak, longest_streak, last_activity_date, language, created_at'

const normalize = (row: Profile): Profile => ({
  ...row,
  average_score: Number(row.average_score),
  best_score: Number(row.best_score),
})

export const SESSION_COLUMNS =
  'id, user_id, technologies, difficulty, question_count, duration_seconds, status, started_at, submitted_at, correct_count, score_percent, xp_earned, bonus_xp, time_spent_seconds, breakdown, auto_submitted'

export const normalizeSession = (row: TestSessionSummary): TestSessionSummary => ({
  ...row,
  score_percent: row.score_percent == null ? null : Number(row.score_percent),
})

export const profileApi = {
  async getById(id: string): Promise<Profile | null> {
    const row = unwrap(
      await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', id).maybeSingle(),
    ) as Profile | null
    return row ? normalize(row) : null
  },

  async update(
    id: string,
    patch: Partial<Pick<Profile, 'full_name' | 'username' | 'avatar_url' | 'language'>>,
  ): Promise<Profile> {
    if (patch.username) {
      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', patch.username)
        .neq('id', id)
        .maybeSingle()
      if (taken) throw new AppError('username_taken')
    }
    const row = unwrap(
      await supabase.from('profiles').update(patch).eq('id', id).select(PROFILE_COLUMNS).single(),
    ) as Profile
    return normalize(row)
  },

  async setLanguage(id: string, language: Language) {
    await supabase.from('profiles').update({ language }).eq('id', id)
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const path = `${userId}/avatar-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' })
    if (error) throw error
    return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
  },

  /** Submitted sessions of a user, newest first. */
  async listSessions(userId: string, limit = 50): Promise<TestSessionSummary[]> {
    const rows = unwrap(
      await supabase
        .from('test_sessions')
        .select(SESSION_COLUMNS)
        .eq('user_id', userId)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(limit),
    ) as TestSessionSummary[]
    return rows.map(normalizeSession)
  },

  /** XP gained per day since the given date (for activity charts). */
  async xpSince(userId: string, since: Date) {
    return unwrap(
      await supabase
        .from('xp_events')
        .select('amount, created_at')
        .eq('user_id', userId)
        .gte('created_at', since.toISOString())
        .order('created_at'),
    ) as { amount: number; created_at: string }[]
  },
}
