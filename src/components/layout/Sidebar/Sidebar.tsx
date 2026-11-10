import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import { Avatar, ProgressBar } from '@/components/ui'
import { Logo } from '@/components/shared'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useI18n } from '@/locales'
import { useAuthStore } from '@/store/authStore'
import { usePreferencesStore } from '@/store/preferencesStore'
import { toast } from '@/store/toastStore'
import { cn } from '@/utils/cn'
import { getLevelProgress } from '@/utils/level'
import { adminNav, mainNav, type NavItem } from '../navigation'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const visible = isDesktop || mobileOpen

  return (
    <>
      <AnimatePresence>
        {!isDesktop && mobileOpen && (
          <motion.div
            className={styles.backdrop}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {visible && (
          <SidebarPanel key="sidebar" isDesktop={isDesktop} onNavigate={isDesktop ? undefined : onClose} onClose={onClose} />
        )}
      </AnimatePresence>
    </>
  )
}

function SidebarPanel({ isDesktop, onNavigate, onClose }: { isDesktop: boolean; onNavigate?: () => void; onClose: () => void }) {
  const { t, f } = useI18n()
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const collapsed = usePreferencesStore((s) => s.sidebarCollapsed) && isDesktop
  const toggleSidebar = usePreferencesStore((s) => s.toggleSidebar)
  const navigate = useNavigate()
  const progress = getLevelProgress(profile?.xp ?? 0)

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const label = item.label(t)
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        className={({ isActive }) => cn(styles.link, isActive && styles.active)}
      >
        <Icon aria-hidden />
        <span className={styles.label}>{label}</span>
      </NavLink>
    )
  }

  const handleLogout = async () => {
    await signOut()
    toast.info(t.auth.loggedOut)
    navigate('/login', { replace: true })
  }

  return (
    <motion.aside
      className={cn(styles.sidebar, collapsed && styles.collapsed)}
      aria-label="Sidebar"
      initial={isDesktop ? false : { x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 38 }}
    >
      <div className={styles.brand}>
        <Logo compact={collapsed} />
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={toggleSidebar}
          aria-label={collapsed ? t.nav.openMenu : t.nav.closeMenu}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t.nav.closeMenu}>
          <X />
        </button>
      </div>

      <nav className={styles.nav}>
        <div className={styles.group}>
          <span className={styles.groupTitle}>{t.nav.main}</span>
          {mainNav.map(renderItem)}
        </div>
        {profile?.role === 'admin' && (
          <div className={styles.group}>
            <span className={styles.groupTitle}>{t.nav.admin}</span>
            {adminNav.map(renderItem)}
          </div>
        )}
      </nav>

      {profile && (
        <div className={styles.footer}>
          <NavLink to="/profile" className={styles.profile} onClick={onNavigate} title={profile.full_name}>
            <Avatar name={profile.full_name} src={profile.avatar_url} size={38} />
            <span className={styles.profileText}>
              <span className={styles.profileName}>{profile.full_name}</span>
              <span className={styles.profileMeta}>
                {t.common.level} {progress.level} · {f(t.dashboard.xpToNext, { xp: progress.required - progress.current, level: progress.level + 1 })}
              </span>
            </span>
          </NavLink>
          <div className={styles.progress}>
            <ProgressBar value={progress.percent} height={5} label={t.common.level} />
          </div>
          <button type="button" className={styles.link} onClick={handleLogout} title={collapsed ? t.nav.logout : undefined}>
            <LogOut aria-hidden />
            <span className={styles.label}>{t.nav.logout}</span>
          </button>
        </div>
      )}
    </motion.aside>
  )
}
