import { Award } from 'lucide-react'
import { Card, EmptyState, ErrorState, ProgressBar, SkeletonCard } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { AchievementCard, AchievementGrid, achievementsApi } from '@/features/achievements'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { useAuthStore } from '@/store/authStore'

export default function AchievementsPage() {
  const { t, f } = useI18n()
  const toMessage = useErrorMessage()
  const userId = useAuthStore((s) => s.profile?.id ?? '')
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([achievementsApi.list(), achievementsApi.listEarned(userId)]),
    [userId],
  )

  const all = data?.[0] ?? []
  const earned = new Map((data?.[1] ?? []).map((e) => [e.achievement_id, e.earned_at]))
  const sorted = [...all].sort((a, b) => Number(earned.has(b.id)) - Number(earned.has(a.id)) || a.sort_order - b.sort_order)

  return (
    <div className="page">
      <PageHeader
        eyebrow={<><Award /> {t.nav.achievements}</>}
        title={t.achievements.title}
        subtitle={data ? f(t.achievements.subtitle, { earned: earned.size, total: all.length }) : undefined}
      />
      {error ? (
        <ErrorState message={toMessage(error)} onRetry={reload} />
      ) : loading || !data ? (
        <SkeletonCard lines={6} height={300} />
      ) : all.length === 0 ? (
        <Card>
          <EmptyState title={t.achievements.empty} />
        </Card>
      ) : (
        <>
          <ProgressBar value={earned.size} max={all.length} height={8} shine label={t.achievements.title} />
          <AchievementGrid>
            {sorted.map((a, i) => (
              <AchievementCard key={a.id} achievement={a} earnedAt={earned.get(a.id)} index={i} />
            ))}
          </AchievementGrid>
        </>
      )}
    </div>
  )
}
