import { RouterProvider } from 'react-router'
import { isSupabaseConfigured } from '@/services/supabase/client'
import { SetupRequiredPage } from '@/pages/errors/SetupRequiredPage'
import { AppProviders } from './providers/AppProviders'
import { router } from './router/routes'

export function App() {
  return (
    <AppProviders>
      {isSupabaseConfigured ? <RouterProvider router={router} /> : <SetupRequiredPage />}
    </AppProviders>
  )
}
