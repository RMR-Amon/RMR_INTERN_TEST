/**
 * Level curve — must match public.level_for_xp() in the database.
 * Level L starts at 50 * (L - 1)^2 XP → 0, 50, 200, 450, 800, 1250 ...
 */
export const XP_PER_LEVEL_UNIT = 50

export const levelForXp = (xp: number): number =>
  Math.floor(Math.sqrt(Math.max(xp, 0) / XP_PER_LEVEL_UNIT)) + 1

export const xpForLevel = (level: number): number => XP_PER_LEVEL_UNIT * (level - 1) ** 2

export interface LevelProgress {
  level: number
  current: number
  required: number
  percent: number
  nextLevelXp: number
}

export const getLevelProgress = (xp: number): LevelProgress => {
  const level = levelForXp(xp)
  const start = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const current = xp - start
  const required = next - start
  return {
    level,
    current,
    required,
    percent: required > 0 ? Math.min(100, (current / required) * 100) : 0,
    nextLevelXp: next,
  }
}
