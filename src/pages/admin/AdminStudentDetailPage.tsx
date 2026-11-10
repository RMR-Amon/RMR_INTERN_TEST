import { Navigate, useParams } from 'react-router'
import { StudentDetail } from '@/features/admin'

export default function AdminStudentDetailPage() {
  const { userId } = useParams()
  if (!userId) return <Navigate to="/admin/students" replace />
  return <StudentDetail key={userId} userId={userId} />
}
