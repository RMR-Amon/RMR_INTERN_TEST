import { Activity, Award, BarChart3, Clock3, Flame, Medal, Target, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardHeader, EmptyState, ErrorState, LinkButton, Skeleton, SkeletonCard } from '@/components/ui'
import { StatCard, StatisticsChart } from '@/components/shared'
import { AchievementCard } from '@/features/achievements'
import { TestCardList } from '@/features/tests'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import type { Profile } from '@/types'
import { formatPercent } from '@/utils/format'
import { useStudentOverview } from '../hooks/useStudentOverview'
import { computeRecommendations, computeTechStats, computeWeeklyActivity } from '../lib/stats'
import styles from './Dashboard.module.scss'
import { RecommendedTests } from './RecommendedTests'
import { TechnologiesOverview } from './TechnologiesOverview'
import { WelcomeSection } from './WelcomeSection'

export function StudentDashboard({ profile }: { profile: Profile }) {
  const { t, f, lang } = useI18n()
  useDocumentTitle(t.nav.dashboard)
  const toMessage = useErrorMessage()
  const { data, loading, error, reload } = useStudentOverview(profile.id, profile.xp)

  const derived = useMemo(() => {
    if (!data) return null
    const techStats = computeTechStats(data.sessions)
    const weekly = computeWeeklyActivity(data.xpEvents, data.sessions, lang)
    const recommendations = computeRecommendations(techStats, data.technologies, profile.average_score)
    const earnedMap = new Map(data.earned.map((e) => [e.achievement_id, e.earned_at]))
    const recentAchievements = data.achievements
      .filter((a) => earnedMap.has(a.id))
      .sort((a, b) => (earnedMap.get(b.id) ?? '').localeCompare(earnedMap.get(a.id) ?? ''))
      .slice(0, 3)
    const nextAchievements = data.achievements.filter((a) => !earnedMap.has(a.id)).slice(0, Math.max(0, 3 - recentAchievements.length))
    return { techStats, weekly, recommendations, earnedMap, recentAchievements, nextAchievements }
  }, [data, lang, profile.average_score])

  if (error && !data) return <ErrorState message={toMessage(error)} onRetry={reload} />

  return (
    <div className="page">
      <WelcomeSection profile={profile} rank={data?.rank ?? null} activeSessionId={data?.activeSessionId ?? null} />

      <div className={styles.statsGrid}>
        <StatCard icon={<Target />} tone="cyan" label={t.dashboard.testsCompleted} value={profile.tests_completed} />
        <StatCard icon={<BarChart3 />} tone="violet" label={t.dashboard.averageScore} value={formatPercent(profile.average_score)} />
        <StatCard icon={<Medal />} tone="green" label={t.dashboard.bestScore} value={formatPercent(profile.best_score)} />
        <StatCard
          icon={<Trophy />}
          tone="amber"
          label={t.dashboard.globalRank}
          value={loading && !data ? <Skeleton width={48} height={24} /> : data?.rank ? `#${data.rank}` : t.dashboard.unranked}
        />
        <StatCard
          icon={<Flame />}
          tone="rose"
          label={t.dashboard.streak}
          value={`${profile.current_streak} ${t.common.days}`}
          hint={`${t.profile.longestStreak}: ${profile.longest_streak}`}
        />
      </div>

      {!data || !derived ? (
        <div className="page-grid">
          <div className="stack">
            <SkeletonCard lines={4} height={260} />
            <SkeletonCard lines={4} />
          </div>
          <div className="stack">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        </div>
      ) : (
        <div className="page-grid">
          <div className="stack">
            <Card>
              <CardHeader
                title={t.dashboard.weeklyActivity}
                subtitle={t.dashboard.weeklyActivityHint}
                icon={<Activity />}
                action={<span className={styles.activityTotal}>{f(t.dashboard.testsThisWeek, { count: derived.weekly.testsThisWeek })}</span>}
              />
              <StatisticsChart data={derived.weekly.data} ariaLabel={t.dashboard.weeklyActivity} height={190} />
            </Card>

            <Card>
              <CardHeader
                title={t.dashboard.recentTests}
                icon={<Clock3 />}
                action={
                  data.sessions.length > 0 && (
                    <LinkButton to="/history" variant="ghost" size="sm">
                      {t.common.viewAll}
                    </LinkButton>
                  )
                }
              />
              {data.sessions.length === 0 ? (
                <EmptyState
                  title={t.dashboard.noTests}
                  text={t.dashboard.noTestsHint}
                  action={<LinkButton to="/tests">{t.dashboard.startTest}</LinkButton>}
                />
              ) : (
                <TestCardList sessions={data.sessions.slice(0, 5)} />
              )}
            </Card>

            <TechnologiesOverview technologies={data.technologies} stats={derived.techStats} />
          </div>

          <div className="stack">
            <RecommendedTests items={derived.recommendations} />
            <Card>
              <CardHeader
                title={t.dashboard.achievements}
                subtitle={f(t.achievements.subtitle, { earned: data.earned.length, total: data.achievements.length })}
                icon={<Award />}
                action={
                  <LinkButton to="/achievements" variant="ghost" size="sm">
                    {t.common.viewAll}
                  </LinkButton>
                }
              />
              <div className={styles.achList}>
                {[...derived.recentAchievements, ...derived.nextAchievements].map((a, i) => (
                  <AchievementCard key={a.id} achievement={a} earnedAt={derived.earnedMap.get(a.id)} index={i} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
