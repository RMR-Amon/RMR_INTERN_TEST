import {
  Award,
  Brain,
  Calendar,
  Crown,
  Flame,
  Layers,
  Medal,
  Rocket,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/** Icon names admins can choose for achievements. */
export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  award: Award,
  rocket: Rocket,
  target: Target,
  medal: Medal,
  brain: Brain,
  crown: Crown,
  flame: Flame,
  layers: Layers,
  zap: Zap,
  calendar: Calendar,
  'trending-up': TrendingUp,
  star: Star,
  sparkles: Sparkles,
  trophy: Trophy,
}

export function AchievementIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = ACHIEVEMENT_ICONS[name] ?? Award
  return <Icon width={size} height={size} aria-hidden />
}
