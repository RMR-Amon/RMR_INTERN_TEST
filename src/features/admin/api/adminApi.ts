import { normalizeSession, PROFILE_COLUMNS, SESSION_COLUMNS } from '@/features/profile/api/profileApi'
import { supabase } from '@/services/supabase/client'
import { unwrap } from '@/services/supabase/errors'
import type {
  Achievement,
  AdminOverview,
  AppSettings,
  Difficulty,
  Profile,
  Question,
  QuestionInput,
  Role,
  Technology,
  TestSessionSummary,
  XpEvent,
} from '@/types'

export interface StudentFilters {
  search: string
  page: number
  pageSize: number
}

export interface QuestionFilters {
  search: string
  technology: string
  difficulty: Difficulty | 'all'
  page: number
  pageSize: number
}

export interface Paged<T> {
  rows: T[]
  total: number
}

export type SessionWithStudent = TestSessionSummary & {
  profiles: Pick<Profile, 'full_name' | 'username' | 'avatar_url'> | null
}

const sanitizeSearch = (value: string) => value.replace(/[%,()]/g, ' ').trim()

/**
 * Admin data access. Every call is authorised on the server:
 * RLS policies use public.is_admin(), RPCs re-check the role.
 */
export const adminApi = {
  async overview(): Promise<AdminOverview> {
    return unwrap(await supabase.rpc('admin_overview')) as AdminOverview
  },

  // ---------------- Students ----------------
  async listStudents({ search, page, pageSize }: StudentFilters): Promise<Paged<Profile>> {
    let query = supabase
      .from('profiles')
      .select(PROFILE_COLUMNS, { count: 'exact' })
      .order('xp', { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1)
    const term = sanitizeSearch(search)
    if (term) query = query.or(`full_name.ilike.%${term}%,username.ilike.%${term}%`)
    const { data, error, count } = await query
    const rows = unwrap({ data, error }) as Profile[]
    return { rows, total: count ?? 0 }
  },

  async getStudent(id: string): Promise<Profile | null> {
    return unwrap(
      await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', id).maybeSingle(),
    ) as Profile | null
  },

  async updateStudent(
    id: string,
    patch: { full_name: string; username: string; role: Role; is_blocked: boolean },
  ) {
    unwrap(
      await supabase.rpc('admin_update_profile', {
        p_user_id: id,
        p_full_name: patch.full_name,
        p_username: patch.username,
        p_role: patch.role,
        p_is_blocked: patch.is_blocked,
      }),
    )
  },

  async adjustXp(id: string, amount: number, note: string): Promise<number> {
    return unwrap(
      await supabase.rpc('admin_adjust_xp', { p_user_id: id, p_amount: amount, p_note: note }),
    ) as number
  },

  async resetProgress(id: string) {
    unwrap(await supabase.rpc('admin_reset_progress', { p_user_id: id }))
  },

  async xpLog(id: string): Promise<XpEvent[]> {
    return unwrap(
      await supabase
        .from('xp_events')
        .select('id, amount, reason, note, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
    ) as XpEvent[]
  },

  async grantAchievement(userId: string, achievementId: string) {
    unwrap(
      await supabase
        .from('student_achievements')
        .insert({ user_id: userId, achievement_id: achievementId }),
    )
  },

  async revokeAchievement(userId: string, achievementId: string) {
    unwrap(
      await supabase
        .from('student_achievements')
        .delete()
        .eq('user_id', userId)
        .eq('achievement_id', achievementId),
    )
  },

  // ---------------- Questions ----------------
  async listQuestions(f: QuestionFilters): Promise<Paged<Question>> {
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .order('technology')
      .order('id')
      .range(f.page * f.pageSize, f.page * f.pageSize + f.pageSize - 1)
    if (f.technology !== 'all') query = query.eq('technology', f.technology)
    if (f.difficulty !== 'all') query = query.eq('difficulty', f.difficulty)
    const term = sanitizeSearch(f.search)
    if (term) {
      query = query.or(
        `id.ilike.%${term}%,question->>en.ilike.%${term}%,question->>ru.ilike.%${term}%,question->>uz.ilike.%${term}%`,
      )
    }
    const { data, error, count } = await query
    return { rows: unwrap({ data, error }) as Question[], total: count ?? 0 }
  },

  async saveQuestion(input: QuestionInput): Promise<Question> {
    const payload = {
      technology: input.technology,
      difficulty: input.difficulty,
      question: input.question,
      code: input.code?.trim() ? input.code : null,
      options: input.options,
      correct_index: input.correct_index,
      explanation: input.explanation,
      xp_reward: input.xp_reward,
      is_active: input.is_active,
    }
    const query = input.id
      ? supabase.from('questions').update(payload).eq('id', input.id)
      : supabase.from('questions').insert(payload)
    return unwrap(await query.select('*').single()) as Question
  },

  async deleteQuestion(id: string) {
    unwrap(await supabase.from('questions').delete().eq('id', id))
  },

  // ---------------- Technologies ----------------
  async saveTechnology(tech: Technology, isNew: boolean) {
    const payload = {
      name: tech.name,
      color: tech.color,
      sort_order: tech.sort_order,
      is_active: tech.is_core ? true : tech.is_active,
      description: tech.description,
    }
    const query = isNew
      ? supabase.from('technologies').insert({ ...payload, id: tech.id, is_core: false })
      : supabase.from('technologies').update(payload).eq('id', tech.id)
    unwrap(await query)
  },

  async deleteTechnology(id: string) {
    unwrap(await supabase.from('technologies').delete().eq('id', id))
  },

  // ---------------- Achievements ----------------
  async saveAchievement(a: Achievement, isNew: boolean) {
    const payload = {
      title: a.title,
      description: a.description,
      icon: a.icon,
      tier: a.tier,
      xp_bonus: a.xp_bonus,
      condition_type: a.condition_type,
      condition_value: a.condition_value,
      is_active: a.is_active,
      sort_order: a.sort_order,
    }
    const query = isNew
      ? supabase.from('achievements').insert({ ...payload, id: a.id })
      : supabase.from('achievements').update(payload).eq('id', a.id)
    unwrap(await query)
  },

  async deleteAchievement(id: string) {
    unwrap(await supabase.from('achievements').delete().eq('id', id))
  },

  // ---------------- Sessions ----------------
  async listSessions(page: number, pageSize: number, userId?: string): Promise<Paged<SessionWithStudent>> {
    let query = supabase
      .from('test_sessions')
      .select(`${SESSION_COLUMNS}, profiles(full_name, username, avatar_url)`, { count: 'exact' })
      .order('started_at', { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1)
    if (userId) query = query.eq('user_id', userId)
    const { data, error, count } = await query
    const rows = (unwrap({ data, error }) as unknown as SessionWithStudent[]).map((r) => ({
      ...r,
      ...normalizeSession(r),
    }))
    return { rows, total: count ?? 0 }
  },

  // ---------------- Settings ----------------
  async saveSettings(settings: AppSettings) {
    unwrap(await supabase.from('app_settings').update(settings).eq('id', 1))
  },
}
