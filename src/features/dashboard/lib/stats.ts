import type { ChartDatum } from '@/components/shared'
import type { Language, Technology, TestDifficulty, TestSessionSummary } from '@/types'
import { dayKey, formatWeekday } from '@/utils/format'

export interface TechStat {
  technology: string
  correct: number
  total: number
  percent: number
  best: number
}

/** Accuracy and personal best per technology across all submitted sessions. */
export const computeTechStats = (sessions: TestSessionSummary[]): Record<string, TechStat> => {
  const map: Record<string, TechStat> = {}
  for (const s of sessions) {
    for (const b of s.breakdown ?? []) {
      const entry = (map[b.technology] ??= { technology: b.technology, correct: 0, total: 0, percent: 0, best: 0 })
      entry.correct += b.correct
      entry.total += b.total
      if (b.total > 0) entry.best = Math.max(entry.best, Math.round((b.correct / b.total) * 100))
    }
  }
  for (const entry of Object.values(map)) {
    entry.percent = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0
  }
  return map
}

/** Last 7 days of XP (local days), today highlighted. */
export const computeWeeklyActivity = (
  events: { amount: number; created_at: string }[],
  sessions: TestSessionSummary[],
  lang: Language,
): { data: ChartDatum[]; testsThisWeek: number } => {
  const days: { key: string; date: Date }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    days.push({ key: dayKey(d), date: d })
  }
  const xpByDay: Record<string, number> = {}
  for (const e of events) {
    const k = dayKey(new Date(e.created_at))
    xpByDay[k] = (xpByDay[k] ?? 0) + e.amount
  }
  const testsByDay: Record<string, number> = {}
  for (const s of sessions) {
    if (!s.submitted_at) continue
    const k = dayKey(new Date(s.submitted_at))
    testsByDay[k] = (testsByDay[k] ?? 0) + 1
  }
  const todayKey = days[days.length - 1].key
  const data = days.map(({ key, date }) => {
    const xp = Math.max(0, xpByDay[key] ?? 0)
    const tests = testsByDay[key] ?? 0
    return { label: formatWeekday(date, lang), value: xp, tooltip: `${xp} XP · ${tests}`, highlight: key === todayKey }
  })
  const testsThisWeek = days.reduce((sum, d) => sum + (testsByDay[d.key] ?? 0), 0)
  return { data, testsThisWeek }
}

export interface Recommendation {
  kind: 'focus' | 'start' | 'challenge'
  technology?: string
  difficulty: TestDifficulty
  optional: string[]
  percent?: number
}

/** Up to 3 recommended test presets based on weakest technologies. */
export const computeRecommendations = (
  stats: Record<string, TechStat>,
  technologies: Technology[],
  averageScore: number,
): Recommendation[] => {
  const recs: Recommendation[] = []
  const tried = Object.values(stats).filter((s) => s.total > 0)

  if (tried.length === 0) {
    recs.push({ kind: 'start', difficulty: 'easy', optional: [] })
  } else {
    const weakest = [...tried].sort((a, b) => a.percent - b.percent).slice(0, 2)
    for (const w of weakest) {
      const tech = technologies.find((x) => x.id === w.technology)
      recs.push({
        kind: 'focus',
        technology: w.technology,
        difficulty: w.percent < 50 ? 'easy' : 'medium',
        optional: tech && !tech.is_core ? [tech.id] : [],
        percent: w.percent,
      })
    }
  }

  // suggest an untried optional technology
  const untried = technologies.find((x) => !x.is_core && !stats[x.id])
  if (untried && recs.length < 3) {
    recs.push({ kind: 'focus', technology: untried.id, difficulty: 'easy', optional: [untried.id] })
  }

  if (recs.length < 3 && (averageScore >= 70 || tried.length > 0)) {
    recs.push({ kind: 'challenge', difficulty: 'hard', optional: technologies.filter((x) => !x.is_core).map((x) => x.id) })
  }
  return recs.slice(0, 3)
}

export const presetToQuery = (r: Recommendation) => {
  const params = new URLSearchParams({ difficulty: r.difficulty })
  if (r.optional.length) params.set('tech', r.optional.join(','))
  return `/tests?${params.toString()}`
}
