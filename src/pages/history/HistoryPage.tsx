import { History, LineChart } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardHeader, EmptyState, ErrorState, LinkButton, SkeletonCard } from '@/components/ui'
import { PageHeader, StatisticsChart } from '@/components/shared'
import { computeTechStats } from '@/features/dashboard'
import { PersonalBests, profileApi } from '@/features/profile'
import { TestCardList } from '@/features/tests'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { useAuthStore } from '@/store/authStore'
import { formatShortDate } from '@/utils/format'

export default function HistoryPage() {
  const { t, lang } = useI18n()
  const toMessage = useErrorMessage()
  const userId = useAuthStore((s) => s.profile?.id ?? '')
  const { data: sessions, loading, error, reload } = useAsync(() => profileApi.listSessions(userId, 200), [userId])

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
  const stats = useMemo(() => computeTechStats(sessions ?? []), [sessions])

  return (
    <div className="page">
      <PageHeader eyebrow={<><History /> {t.nav.history}</>} title={t.history.title} subtitle={t.history.subtitle} />
      {error ? (
        <ErrorState message={toMessage(error)} onRetry={reload} />
      ) : loading || !sessions ? (
        <SkeletonCard lines={6} height={320} />
      ) : sessions.length === 0 ? (
        <Card>
          <EmptyState title={t.history.empty} action={<LinkButton to="/tests">{t.dashboard.startTest}</LinkButton>} />
        </Card>
      ) : (
        <div className="page-grid">
          <Card>
            <CardHeader title={t.history.title} subtitle={`${t.common.total}: ${sessions.length}`} icon={<History />} />
            <TestCardList sessions={sessions} />
          </Card>
          <div className="stack">
            {trend.length > 1 && (
              <Card>
                <CardHeader title={t.profile.scoreTrend} subtitle={t.profile.scoreTrendHint} icon={<LineChart />} />
                <StatisticsChart type="line" data={trend} max={100} height={160} ariaLabel={t.profile.scoreTrend} />
              </Card>
            )}
            <PersonalBests stats={stats} />
          </div>
        </div>
      )}
    </div>
  )
}
