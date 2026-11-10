import { motion } from 'framer-motion'
import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useI18n } from '@/locales'
import { usePreferencesStore } from '@/store/preferencesStore'
import { cn } from '@/utils/cn'
import { RouteFallback } from '../RouteFallback/RouteFallback'
import { Navbar } from '../Navbar/Navbar'
import { Sidebar } from '../Sidebar/Sidebar'
import styles from './AppLayout.module.scss'

/** Authenticated shell: sidebar + sticky navbar + animated page outlet. */
export function AppLayout() {
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)
  const collapsed = usePreferencesStore((s) => s.sidebarCollapsed)
  const { pathname } = useLocation()

  // Scroll to top on navigation (the drawer closes itself via link clicks)
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <>
      <a href="#main" className={styles.skip}>
        {t.common.skipToContent}
      </a>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={cn(styles.shell, collapsed && styles.collapsed)}>
        <Navbar onMenu={() => setMobileOpen(true)} />
        <main id="main" className={styles.main}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>
    </>
  )
}
