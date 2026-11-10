// =====================================================================
// Domain types shared across features
// =====================================================================

export type Language = 'uz' | 'ru' | 'en'
export type Theme = 'dark' | 'light'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type Localized = Record<Language, string>

export type Difficulty = 'easy' | 'medium' | 'hard'
export type TestDifficulty = Difficulty | 'mixed'
export type Role = 'student' | 'admin'

export interface Technology {
  id: string
  name: string
  is_core: boolean
  is_active: boolean
  color: string
  sort_order: number
  description: Partial<Localized>
}

export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  role: Role
  is_blocked: boolean
  xp: number
  level: number
  tests_completed: number
  average_score: number
  best_score: number
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  language: Language
  created_at: string
}

/** Full question — only admins can read this (contains the correct answer). */
export interface Question {
  id: string
  technology: string
  difficulty: Difficulty
  question: Localized
  code: string | null
  options: Localized[]
  correct_index: number
  explanation: Localized
  xp_reward: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type QuestionInput = Omit<Question, 'id' | 'created_at' | 'updated_at'> & { id?: string }

/** Question as delivered to a student during a running test (no answer). */
export interface SessionQuestion {
  id: string
  technology: string
  difficulty: Difficulty
  question: Localized
  code: string | null
  options: Localized[]
  position: number
  selected_index: number | null
}

export type SessionStatus = 'in_progress' | 'submitted' | 'abandoned'

export interface ActiveTestSession {
  id: string
  status: SessionStatus
  technologies: string[]
  difficulty: TestDifficulty
  question_count: number
  duration_seconds: number
  started_at: string
  expires_at: string
  server_now: string
  questions: SessionQuestion[]
}

export interface TechBreakdown {
  technology: string
  total: number
  correct: number
}

export interface TestSessionSummary {
  id: string
  user_id: string
  technologies: string[]
  difficulty: TestDifficulty
  question_count: number
  duration_seconds: number
  status: SessionStatus
  started_at: string
  submitted_at: string | null
  correct_count: number | null
  score_percent: number | null
  xp_earned: number
  bonus_xp: number
  time_spent_seconds: number | null
  breakdown: TechBreakdown[] | null
  auto_submitted: boolean
}

export interface AnswerReview {
  question_id: string
  technology: string
  difficulty: Difficulty
  question: Localized
  code: string | null
  options: Localized[]
  correct_index: number
  explanation: Localized
  selected_index: number | null
  is_correct: boolean
  xp_awarded: number
  position: number
}

export interface TestResult {
  id: string
  user_id: string
  technologies: string[]
  difficulty: TestDifficulty
  question_count: number
  duration_seconds: number
  started_at: string
  submitted_at: string
  correct_count: number
  score_percent: number
  xp_earned: number
  bonus_xp: number
  time_spent_seconds: number
  breakdown: TechBreakdown[]
  auto_submitted: boolean
  new_achievements: Achievement[]
  answers: AnswerReview[]
}

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type AchievementCondition =
  | 'tests_completed'
  | 'total_xp'
  | 'level'
  | 'streak'
  | 'score_at_least'
  | 'hard_score'
  | 'all_technologies'

export interface Achievement {
  id: string
  title: Localized
  description: Localized
  icon: string
  tier: AchievementTier
  xp_bonus: number
  condition_type: AchievementCondition
  condition_value: number
  is_active: boolean
  sort_order: number
}

export interface StudentAchievement {
  achievement_id: string
  earned_at: string
}

export type LeaderboardPeriod = 'all' | 'week' | 'month'

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  full_name: string
  avatar_url: string | null
  level: number
  xp: number
  total_xp: number
  tests_completed: number
}

export interface AppSettings {
  min_questions: number
  max_questions: number
  default_questions: number
  min_duration_minutes: number
  max_duration_minutes: number
  default_duration_minutes: number
  easy_xp: number
  medium_xp: number
  hard_xp: number
  completion_bonus: number
  high_score_bonus: number
  perfect_bonus: number
  completion_min_score: number
  repeat_xp_percent: number
  daily_bonus_cap: number
}

export interface TestConfig {
  optionalTechnologies: string[]
  difficulty: TestDifficulty
  questionCount: number
  durationMinutes: number
}

export interface XpEvent {
  id: number
  amount: number
  reason: 'test' | 'achievement' | 'admin'
  note: string | null
  created_at: string
}

export interface AdminOverview {
  students: number
  blocked: number
  questions: number
  active_questions: number
  tests_total: number
  tests_today: number
  average_score: number
  xp_total: number
  questions_by_technology: Record<string, number>
  tests_last_14_days: { day: string; count: number }[]
}
