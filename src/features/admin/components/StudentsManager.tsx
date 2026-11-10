import { ChevronRight, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Badge, Button, Card, EmptyState, ErrorState, Input, Pagination, Skeleton, Table, tableStyles, UserCell } from '@/components/ui'
import { LevelBadge, PageHeader } from '@/components/shared'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { useI18n } from '@/locales'
import { cn } from '@/utils/cn'
import { formatDate, formatNumber, formatPercent } from '@/utils/format'
import { adminApi } from '../api/adminApi'
import styles from './Admin.module.scss'

const PAGE_SIZE = 20

export function StudentsManager() {
  const { t, lang } = useI18n()
  const toMessage = useErrorMessage()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const debounced = useDebounce(search, 300)

  const { data, loading, error, reload } = useAsync(
    () => adminApi.listStudents({ search: debounced, page, pageSize: PAGE_SIZE }),
    [debounced, page],
  )

  return (
    <div className="page">
      <PageHeader eyebrow={<><Users /> {t.nav.admin}</>} title={t.admin.studentsTitle} subtitle={t.admin.studentsSubtitle} />
      <Card>
        <div className={styles.toolbar}>
          <Input
            icon={<Search />}
            placeholder={t.admin.searchStudents}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            aria-label={t.admin.searchStudents}
          />
        </div>
        {error ? (
          <ErrorState message={toMessage(error)} onRetry={reload} />
        ) : loading && !data ? (
          <Skeleton height={320} />
        ) : !data || data.rows.length === 0 ? (
          <EmptyState title={t.common.noData} />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>{t.admin.name}</th>
                  <th>{t.admin.role}</th>
                  <th>{t.common.level}</th>
                  <th className={tableStyles.right}>XP</th>
                  <th className={tableStyles.right}>{t.admin.tests}</th>
                  <th className={tableStyles.right}>{t.admin.avg}</th>
                  <th>{t.admin.joined}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.rows.map((p) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/students/${p.id}`)}>
                    <td>
                      <UserCell name={p.full_name} username={p.username} avatar={p.avatar_url} />
                    </td>
                    <td>
                      {p.is_blocked ? (
                        <Badge tone="danger">{t.admin.blocked}</Badge>
                      ) : (
                        <Badge tone={p.role === 'admin' ? 'secondary' : 'neutral'}>{t.profile.role[p.role]}</Badge>
                      )}
                    </td>
                    <td>
                      <LevelBadge level={p.level} />
                    </td>
                    <td className={cn(tableStyles.right, tableStyles.strong)}>{formatNumber(p.xp, lang)}</td>
                    <td className={tableStyles.right}>{p.tests_completed}</td>
                    <td className={tableStyles.right}>{formatPercent(p.average_score)}</td>
                    <td>{formatDate(p.created_at, lang)}</td>
                    <td className={tableStyles.right}>
                      <Button variant="ghost" size="sm" iconOnly icon={<ChevronRight />} aria-label={t.admin.details} />
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
