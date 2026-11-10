import { MotionConfig } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { ErrorBoundary } from '@/components/shared'
import { useAuthStore } from '@/store/authStore'
import { usePreferencesStore } from '@/store/preferencesStore'

/** Applies theme / language to <html> and boots the auth listener. */
function PreferencesSync() {
  const theme = usePreferencesStore((s) => s.theme)
  const language = usePreferencesStore((s) => s.language)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#070b16' : '#f4f6fb')
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => useAuthStore.getState().init(), [])

  return null
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {/* "user" → framer-motion respects prefers-reduced-motion */}
      <MotionConfig reducedMotion="user">
        <PreferencesSync />
        {children}
      </MotionConfig>
    </ErrorBoundary>
  )
}
