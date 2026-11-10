import {
  Award,
  ClipboardList,
  FileQuestion,
  History,
  LayoutDashboard,
  Layers,
  Medal,
  Settings,
  SlidersHorizontal,
  Trophy,
  User,
  Users,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import type { Dictionary } from '@/locales'

export interface NavItem {
  to: string
  icon: LucideIcon
  label: (t: Dictionary) => string
  end?: boolean
}

export const mainNav: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: (t) => t.nav.dashboard, end: true },
  { to: '/tests', icon: ClipboardList, label: (t) => t.nav.tests },
  { to: '/history', icon: History, label: (t) => t.nav.history },
  { to: '/leaderboard', icon: Trophy, label: (t) => t.nav.leaderboard },
  { to: '/achievements', icon: Award, label: (t) => t.nav.achievements },
  { to: '/profile', icon: User, label: (t) => t.nav.profile },
  { to: '/settings', icon: Settings, label: (t) => t.nav.settings },
]

export const adminNav: NavItem[] = [
  { to: '/admin', icon: BarChart3, label: (t) => t.nav.adminOverview, end: true },
  { to: '/admin/students', icon: Users, label: (t) => t.nav.adminStudents },
  { to: '/admin/questions', icon: FileQuestion, label: (t) => t.nav.adminQuestions },
  { to: '/admin/categories', icon: Layers, label: (t) => t.nav.adminCategories },
  { to: '/admin/history', icon: History, label: (t) => t.nav.adminHistory },
  { to: '/admin/achievements', icon: Medal, label: (t) => t.nav.adminAchievements },
  { to: '/admin/settings', icon: SlidersHorizontal, label: (t) => t.nav.adminSettings },
]
