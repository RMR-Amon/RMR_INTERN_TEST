import { Award, BarChart3, Trophy } from 'lucide-react'
import { useParams } from 'react-router'
import { Card, CardHeader, ErrorState, SkeletonCard } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { AchievementCard, AchievementGrid } from '@/features/achievements'
import { AnswerReview, ResultSummary, TechBreakdown, testsApi } from '@/features/tests'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { formatDate } from '@/utils/format'

export default function TestResultPage() {
  const { sessionId = '' } = useParams()
  const { t, lang } = useI18n()
  const toMessage = useErrorMessage()
  const { data: result, loading, error, reload } = useAsync(() => testsApi.getResult(sessionId), [sessionId])

  return (
    <div className="page">
      <PageHeader
        eyebrow={<><Trophy /> {t.result.title}</>}
        title={t.result.title}
        subtitle={result ? formatDate(result.submitted_at, lang, true) : undefined}
      />
      {error ? (
        <ErrorState message={toMessage(error)} onRetry={reload} />
      ) : loading || !result ? (
        <>
          <SkeletonCard lines={4} height={260} />
          <SkeletonCard lines={6} height={300} />
        </>
      ) : (
        <>
          <Card glow>
            <ResultSummary result={result} />
          </Card>

          {result.new_achievements.length > 0 && (
            <Card>
              <CardHeader title={t.result.newAchievements} icon={<Award />} />
              <AchievementGrid>
                {result.new_achievements.map((a, i) => (
                  <AchievementCard key={a.id} achievement={a} earnedAt={result.submitted_at} index={i} />
                ))}
              </AchievementGrid>
            </Card>
          )}

          <Card>
            <CardHeader title={t.result.byTechnology} icon={<BarChart3 />} />
            <TechBreakdown items={result.breakdown} />
          </Card>

          <AnswerReview answers={result.answers} />
        </>
      )}
    </div>
  )
}
