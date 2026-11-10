import { achievementsApi } from '@/features/achievements/api/achievementsApi'
import { leaderboardApi } from '@/features/leaderboard/api/leaderboardApi'
import { profileApi } from '@/features/profile/api/profileApi'
import { testsApi } from '@/features/tests/api/testsApi'
import { useAsync } from '@/hooks/useAsync'

/** Everything the dashboard needs, fetched in parallel from real data. */
export const useStudentOverview = (userId: string, xp: number) => {
  return useAsync(async () => {
    const weekStart = new Date()
    weekStart.setHours(0, 0, 0, 0)
    weekStart.setDate(weekStart.getDate() - 6)

    const [sessions, xpEvents, rank, technologies, achievements, earned, activeSessionId] = await Promise.all([
      profileApi.listSessions(userId, 60),
      profileApi.xpSince(userId, weekStart),
      leaderboardApi.getRank(),
      testsApi.listTechnologies(),
      achievementsApi.list(),
      achievementsApi.listEarned(userId),
      testsApi.getActiveSessionId(),
    ])
    return { sessions, xpEvents, rank, technologies, achievements, earned, activeSessionId }
    // xp in deps → refetch after a test changes the profile
  }, [userId, xp])
}
