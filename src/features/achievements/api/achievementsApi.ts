import { supabase } from '@/services/supabase/client'
import { unwrap } from '@/services/supabase/errors'
import type { Achievement, StudentAchievement } from '@/types'

export const achievementsApi = {
  async list(includeInactive = false): Promise<Achievement[]> {
    let query = supabase.from('achievements').select('*').order('sort_order')
    if (!includeInactive) query = query.eq('is_active', true)
    return unwrap(await query) as Achievement[]
  },

  async listEarned(userId: string): Promise<StudentAchievement[]> {
    return unwrap(
      await supabase
        .from('student_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false }),
    ) as StudentAchievement[]
  },
}
