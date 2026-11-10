import { ClipboardList } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { ErrorState, SkeletonCard } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { TestConfigurator, testsApi } from '@/features/tests'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import type { TestDifficulty } from '@/types'

const DIFFICULTIES: TestDifficulty[] = ['easy', 'medium', 'hard', 'mixed']

export default function TestsPage() {
  const { t } = useI18n()
  const toMessage = useErrorMessage()
  const [params] = useSearchParams()

  const { data, loading, error, reload } = useAsync(
    () => Promise.all([testsApi.listTechnologies(), testsApi.getSettings(), testsApi.getActiveSessionId()]),
    [],
  )

  const preset = useMemo(() => {
    const difficulty = params.get('difficulty') as TestDifficulty | null
    return {
      optional: params.get('tech')?.split(',').filter(Boolean),
      difficulty: difficulty && DIFFICULTIES.includes(difficulty) ? difficulty : undefined,
    }
  }, [params])

  return (
    <div className="page">
      <PageHeader eyebrow={<><ClipboardList /> {t.nav.tests}</>} title={t.tests.title} subtitle={t.tests.subtitle} />
      {error ? (
        <ErrorState message={toMessage(error)} onRetry={reload} />
      ) : loading || !data ? (
        <div className="page-grid">
          <div className="stack">
            <SkeletonCard lines={3} height={200} />
            <SkeletonCard lines={3} height={160} />
          </div>
          <SkeletonCard lines={5} height={360} />
        </div>
      ) : (
        <TestConfigurator technologies={data[0]} settings={data[1]} activeSessionId={data[2]} preset={preset} />
      )}
    </div>
  )
}
