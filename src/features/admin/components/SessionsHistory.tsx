import { Eye, History } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Badge, Button, Card, EmptyState, ErrorState, Pagination, Skeleton, Table, tableStyles, UserCell } from '@/components/ui'
import { PageHeader, TechChips } from '@/components/shared'
import { useAsync } from '@/hooks/useAsync'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { cn } from '@/utils/cn'
import { formatClock, formatDate, formatPercent } from '@/utils/format'
import { adminApi } from '../api/adminApi'

const PAGE_SIZE = 25

export function SessionsHistory() {
  const { t, lang } = useI18n()
  const toMessage = useErrorMessage()
  const [page, setPage] = useState(0)
  const { data, loading, error, reload } = useAsync(() => adminApi.listSessions(page, PAGE_SIZE), [page])

  return (
    <div className="page">
      <PageHeader eyebrow={<><History /> {t.nav.admin}</>} title={t.admin.historyTitle} subtitle={t.admin.historySubtitle} />
      <Card>
        {error ? (
          <ErrorState message={toMessage(error)} onRetry={reload} />
        ) : loading && !data ? (
          <Skeleton height={360} />
        ) : !data || data.rows.length === 0 ? (
          <EmptyState title={t.common.noData} />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>{t.admin.student}</th>
                  <th>{t.history.date}</th>
                  <th>{t.history.technologies}</th>
                  <th>{t.history.difficulty}</th>
                  <th>{t.common.status}</th>
                  <th className={tableStyles.right}>{t.history.score}</th>
                  <th className={tableStyles.right}>XP</th>
                  <th className={tableStyles.right}>{t.history.duration}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.rows.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.profiles ? (
                        <Link to={`/admin/students/${s.user_id}`}>
                          <UserCell name={s.profiles.full_name} username={s.profiles.username} avatar={s.profiles.avatar_url} />
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{formatDate(s.started_at, lang, true)}</td>
                    <td style={{ maxWidth: 260 }}>
                      <TechChips ids={s.technologies} />
                    </td>
                    <td>
                      <Badge tone={s.difficulty}>{t.tests.difficulties[s.difficulty]}</Badge>
                    </td>
                    <td>
                      <Badge tone={s.status === 'submitted' ? 'success' : s.status === 'in_progress' ? 'primary' : 'neutral'}>
                        {t.history.statuses[s.status]}
                      </Badge>
                    </td>
                    <td className={cn(tableStyles.right, tableStyles.strong)}>{s.score_percent != null ? formatPercent(s.score_percent) : '—'}</td>
                    <td className={tableStyles.right}>{s.xp_earned}</td>
                    <td className={tableStyles.right}>{s.time_spent_seconds != null ? formatClock(s.time_spent_seconds) : '—'}</td>
                    <td className={tableStyles.right}>
                      {s.status === 'submitted' && (
                        <Link to={`/tests/result/${s.id}`}>
                          <Button variant="ghost" size="sm" iconOnly icon={<Eye />} aria-label={t.history.view} tabIndex={-1} />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
