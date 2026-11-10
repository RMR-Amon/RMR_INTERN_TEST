import { Navigate, useParams } from 'react-router'
import { TestSession } from '@/features/tests'

export default function TestSessionPage() {
  const { sessionId } = useParams()
  if (!sessionId) return <Navigate to="/tests" replace />
  return <TestSession key={sessionId} sessionId={sessionId} />
}
