import { StudentDashboard } from '@/features/dashboard'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  if (!profile) return null
  return <StudentDashboard profile={profile} />
}
