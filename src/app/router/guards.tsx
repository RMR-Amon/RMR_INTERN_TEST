import { Navigate, Outlet, useLocation } from 'react-router'
import { FullscreenLoader } from '@/components/layout/FullscreenLoader/FullscreenLoader'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { useAuthStore } from '@/store/authStore'

/** Only signed-in users. Remembers the target to return after login. */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()
  if (status === 'loading') return <FullscreenLoader />
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Only guests (login / register / forgot password). */
export function GuestRoute() {
  const status = useAuthStore((s) => s.status)
  if (status === 'loading') return <FullscreenLoader />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}

/**
 * Client-side admin gate for UX. The real protection is server-side:
 * RLS policies + SECURITY DEFINER functions check public.is_admin().
 */
export function AdminRoute() {
  const isAdmin = useAuthStore((s) => s.profile?.role === 'admin')
  return isAdmin ? <Outlet /> : <ForbiddenPage />
}
