import { Activity, BarChart3, FileQuestion, Layers, Target, Users, Zap } from 'lucide-react'
import { Card, CardHeader, ErrorState, ProgressBar, SkeletonCard } from '@/components/ui'
import { PageHeader, StatCard, StatisticsChart, TechIcon } from '@/components/shared'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { formatNumber, formatPercent, formatShortDate } from '@/utils/format'
import { techColor, techName } from '@/utils/technology'
import { adminApi } from '../api/adminApi'
import styles from './Admin.module.scss'

export function AdminOverview() {
  const { t, f, lang } = useI18n()
  const toMessage = useErrorMessage()
  const { data, loading, error, reload } = useAsync(() => adminApi.overview(), [])

  const chart =
    data?.tests_last_14_days.map((d, i, arr) => ({
      label: formatShortDate(d.day, lang),
      value: d.count,
      highlight: i === arr.length - 1,
    })) ?? []
  const byTech = Object.entries(data?.questions_by_technology ?? {}).sort((a, b) => b[1] - a[1])
  const maxTech = Math.max(1, ...byTech.map(([, n]) => n))

  return (
    <div className="page">
      <PageHeader eyebrow={<><BarChart3 /> {t.nav.admin}</>} title={t.admin.overviewTitle} subtitle={t.admin.overviewSubtitle} />
      {error ? (
        <ErrorState message={toMessage(error)} onRetry={reload} />
      ) : loading || !data ? (
        <SkeletonCard lines={6} height={300} />
      ) : (
        <>
          <div className={styles.statsGrid}>
            <StatCard icon={<Users />} tone="cyan" label={t.admin.students} value={formatNumber(data.students, lang)} hint={`${t.admin.blocked}: ${data.blocked}`} />
            <StatCard
              icon={<FileQuestion />}
              tone="violet"
              label={t.admin.questions}
              value={data.questions}
              hint={f(t.admin.activeQuestions, { count: data.active_questions })}
            />
            <StatCard icon={<Target />} tone="blue" label={t.admin.testsTaken} value={formatNumber(data.tests_total, lang)} hint={f(t.admin.testsToday, { count: data.tests_today })} />
            <StatCard icon={<BarChart3 />} tone="green" label={t.admin.avgScore} value={formatPercent(data.average_score)} />
            <StatCard icon={<Zap />} tone="amber" label={t.admin.totalXp} value={formatNumber(data.xp_total, lang)} />
          </div>
          <div className="page-grid">
            <Card>
              <CardHeader title={t.admin.testsLast14} icon={<Activity />} />
              <StatisticsChart data={chart} height={220} ariaLabel={t.admin.testsLast14} />
            </Card>
            <Card>
              <CardHeader title={t.admin.questionsByTech} icon={<Layers />} />
              <div className={styles.list} style={{ gap: 14 }}>
                {byTech.map(([id, n]) => (
                  <div key={id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center' }}>
                    <TechIcon id={id} size={30} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{techName(id)}</span>
                      <ProgressBar value={n} max={maxTech} height={5} color={techColor(id)} label={techName(id)} />
                    </div>
                    <strong>{n}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
