import { BarChart3, Flame, Medal, Target, Zap } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardHeader } from '@/components/ui'
import { StatCard, StatisticsChart } from '@/components/shared'
import { computeTechStats } from '@/features/dashboard'
import { leaderboardApi } from '@/features/leaderboard'
import { PersonalBests, ProfileForm, ProfileHero, profileApi } from '@/features/profile'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useI18n } from '@/locales'
import { useAuthStore } from '@/store/authStore'
import { formatNumber, formatPercent, formatShortDate } from '@/utils/format'

export default function ProfilePage() {
  const { t, lang } = useI18n()
  useDocumentTitle(t.profile.title)
  const profile = useAuthStore((s) => s.profile)
  const { data } = useAsync(
    () => Promise.all([profileApi.listSessions(profile?.id ?? '', 100), leaderboardApi.getRank()]),
    [profile?.id, profile?.xp],
  )

  const sessions = data?.[0]
  const stats = useMemo(() => computeTechStats(sessions ?? []), [sessions])
  const trend = useMemo(
    () =>
      (sessions ?? [])
        .slice(0, 10)
        .reverse()
        .map((s) => ({
          label: s.submitted_at ? formatShortDate(s.submitted_at, lang) : '',
          value: Math.round(s.score_percent ?? 0),
          tooltip: `${Math.round(s.score_percent ?? 0)}%`,
        })),
    [sessions, lang],
  )

  if (!profile) return null

  return (
    <div className="page">
      <ProfileHero profile={profile} rank={data?.[1] ?? null} />
      <div className="page-grid">
        <div className="stack">
          <Card>
            <CardHeader title={t.profile.stats} icon={<BarChart3 />} />
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
              <StatCard icon={<Zap />} tone="amber" label={t.profile.totalXp} value={formatNumber(profile.xp, lang)} />
              <StatCard icon={<Target />} tone="cyan" label={t.dashboard.testsCompleted} value={profile.tests_completed} />
              <StatCard icon={<BarChart3 />} tone="violet" label={t.dashboard.averageScore} value={formatPercent(profile.average_score)} />
              <StatCard icon={<Medal />} tone="green" label={t.dashboard.bestScore} value={formatPercent(profile.best_score)} />
              <StatCard icon={<Flame />} tone="rose" label={t.profile.longestStreak} value={`${profile.longest_streak} ${t.common.days}`} />
            </div>
          </Card>
          {trend.length > 1 && (
            <Card>
              <CardHeader title={t.profile.scoreTrend} subtitle={t.profile.scoreTrendHint} icon={<BarChart3 />} />
              <StatisticsChart type="line" data={trend} max={100} height={180} ariaLabel={t.profile.scoreTrend} />
            </Card>
          )}
          <PersonalBests stats={stats} />
        </div>
        <div className="stack">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
