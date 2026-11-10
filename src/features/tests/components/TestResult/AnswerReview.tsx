import { BookOpen, ListChecks } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Card, CardHeader, EmptyState, SegmentedControl } from '@/components/ui'
import { XPBadge } from '@/components/shared'
import { useI18n } from '@/locales'
import type { AnswerReview as Review } from '@/types'
import { cn } from '@/utils/cn'
import { pickLocalized } from '@/utils/localized'
import { QuestionCard } from '../QuestionCard/QuestionCard'
import styles from './TestResult.module.scss'

type Filter = 'all' | 'correct' | 'incorrect'

/** Post-submission review: correct / incorrect answers with explanations. */
export function AnswerReview({ answers }: { answers: Review[] }) {
  const { t, lang } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')

  const visible = useMemo(
    () =>
      answers.filter((a) => (filter === 'all' ? true : filter === 'correct' ? a.is_correct : !a.is_correct)),
    [answers, filter],
  )
  const correctCount = answers.filter((a) => a.is_correct).length

  return (
    <Card>
      <div className={styles.reviewHead}>
        <CardHeader title={t.result.review} icon={<ListChecks />} />
        <SegmentedControl<Filter>
          ariaLabel={t.result.review}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `${t.result.filterAll} · ${answers.length}` },
            { value: 'correct', label: `${t.result.filterCorrect} · ${correctCount}` },
            { value: 'incorrect', label: `${t.result.filterIncorrect} · ${answers.length - correctCount}` },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className={styles.reviewList}>
          {visible.map((a) => (
            <div key={a.question_id} className={cn(styles.reviewItem, a.is_correct ? styles.itemCorrect : styles.itemWrong)}>
              <QuestionCard
                number={a.position}
                total={answers.length}
                technology={a.technology}
                difficulty={a.difficulty}
                question={a.question}
                code={a.code}
                options={a.options}
                disabled
                optionState={(i) =>
                  i === a.correct_index ? 'correct' : i === a.selected_index ? 'wrong' : 'dimmed'
                }
                footer={
                  <>
                    <div className={styles.explanation}>
                      <BookOpen aria-hidden />
                      <div>
                        <strong>{t.result.explanation}</strong>
                        <p>{pickLocalized(a.explanation, lang)}</p>
                      </div>
                    </div>
                    <div className={styles.itemFooter}>
                      {a.selected_index == null ? (
                        <Badge tone="warning">{t.result.notAnswered}</Badge>
                      ) : (
                        <Badge tone={a.is_correct ? 'success' : 'danger'}>
                          {a.is_correct ? t.result.correct : t.result.incorrect}
                        </Badge>
                      )}
                      {a.xp_awarded > 0 && <XPBadge xp={a.xp_awarded} sign />}
                    </div>
                  </>
                }
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
