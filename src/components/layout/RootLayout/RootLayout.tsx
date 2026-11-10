import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui'
import { SeasonalEffects } from '@/features/seasonal-effects'
import { FullscreenLoader } from '../FullscreenLoader/FullscreenLoader'

/** Top-level route element: global decorative + notification layers. */
export function RootLayout() {
  return (
    <>
      <Suspense fallback={<FullscreenLoader />}>
        <Outlet />
      </Suspense>
      <SeasonalEffects />
      <Toaster />
    </>
  )
}
