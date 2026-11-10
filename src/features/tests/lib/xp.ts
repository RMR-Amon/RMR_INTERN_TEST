import type { AppSettings, TestDifficulty } from '@/types'

/** Upper bound of XP a test can give (first-time answers, all correct, all bonuses). */
export const estimateMaxXp = (settings: AppSettings, difficulty: TestDifficulty, count: number) => {
  const perQuestion =
    difficulty === 'easy'
      ? settings.easy_xp
      : difficulty === 'medium'
        ? settings.medium_xp
        : difficulty === 'hard'
          ? settings.hard_xp
          : Math.round((settings.easy_xp + settings.medium_xp + settings.hard_xp) / 3)
  return perQuestion * count + settings.completion_bonus + settings.high_score_bonus + settings.perfect_bonus
}

export type Grade = 'excellent' | 'good' | 'fair' | 'poor'

export const gradeForScore = (score: number): Grade =>
  score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor'
