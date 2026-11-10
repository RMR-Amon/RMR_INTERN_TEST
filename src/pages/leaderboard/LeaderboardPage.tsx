import { Calendar, CalendarDays, Globe, Trophy } from 'lucide-react'
import { useState } from 'react'
import { Card, EmptyState, ErrorState, SegmentedControl, SkeletonCard } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { LeaderboardTable, leaderboardApi, Podium } from '@/features/leaderboard'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { useAuthStore } from '@/store/authStore'
import type { LeaderboardPeriod } from '@/types'

export default function LeaderboardPage() {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const userId = useAuthStore((s) => s.profile?.id)
  const [period, setPeriod] = useState<LeaderboardPeriod>('all')
  const { data, loading, error, reload } = useAsync(() => leaderboardApi.list(period, 100), [period])

  return (
    <div className="page">
      <PageHeader
        eyebrow={<><Trophy /> {t.nav.leaderboard}</>}
        title={t.leaderboard.title}
        subtitle={t.leaderboard.subtitle}
        actions={
          <SegmentedControl<LeaderboardPeriod>
            ariaLabel={t.leaderboard.title}
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'all', label: t.leaderboard.periods.all, icon: <Globe /> },
              { value: 'month', label: t.leaderboard.periods.month, icon: <CalendarDays /> },
              { value: 'week', label: t.leaderboard.periods.week, icon: <Calendar /> },
            ]}
          />
        }
      />
      {error ? (
        <ErrorState message={toMessage(error)} onRetry={reload} />
      ) : loading || !data ? (
        <SkeletonCard lines={8} height={420} />
      ) : data.length === 0 ? (
        <Card>
          <EmptyState icon={<Trophy />} title={t.leaderboard.empty} />
        </Card>
      ) : (
        <>
          <Podium entries={data.slice(0, 3)} />
          <Card padding="sm">
            <LeaderboardTable entries={data} currentUserId={userId} />
          </Card>
        </>
      )}
    </div>
  )
}
