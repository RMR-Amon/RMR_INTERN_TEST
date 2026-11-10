import { supabase } from '@/services/supabase/client'
import { unwrap } from '@/services/supabase/errors'
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types'

export const leaderboardApi = {
  async list(period: LeaderboardPeriod, limit = 100): Promise<LeaderboardEntry[]> {
    const rows = unwrap(
      await supabase.rpc('get_leaderboard', { p_period: period, p_limit: limit }),
    ) as LeaderboardEntry[]
    return rows.map((r) => ({
      ...r,
      rank: Number(r.rank),
      xp: Number(r.xp),
      tests_completed: Number(r.tests_completed),
    }))
  },

  async getRank(userId?: string): Promise<number | null> {
    const rank = unwrap(
      await supabase.rpc('get_user_rank', userId ? { p_user_id: userId } : {}),
    ) as number | null
    return rank ?? null
  },
}
