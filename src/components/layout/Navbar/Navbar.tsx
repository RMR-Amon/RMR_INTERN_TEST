import { Menu, Play } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar, LinkButton } from '@/components/ui'
import { LanguageSwitcher, Logo, ThemeSwitcher, XPBadge } from '@/components/shared'
import { SeasonalGreeting } from '@/features/seasonal-effects'
import { useI18n } from '@/locales'
import { useAuthStore } from '@/store/authStore'
import styles from './Navbar.module.scss'

export function Navbar({ onMenu }: { onMenu: () => void }) {
  const { t } = useI18n()
  const profile = useAuthStore((s) => s.profile)

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button type="button" className={styles.menuBtn} onClick={onMenu} aria-label={t.nav.openMenu}>
          <Menu />
        </button>
        <Logo className={styles.mobileLogo} />
        <div className={styles.season}>
          <SeasonalGreeting />
        </div>
      </div>

      <div className={styles.right}>
        <LinkButton to="/tests" size="sm" icon={<Play />} className={styles.startBtn}>
          {t.dashboard.startTest}
        </LinkButton>
        {profile && (
          <span className={styles.xp}>
            <XPBadge xp={profile.xp} />
          </span>
        )}
        <span className={styles.hideSm}>
          <LanguageSwitcher />
        </span>
        <ThemeSwitcher />
        {profile && (
          <Link to="/profile" className={styles.avatarLink} aria-label={t.nav.profile}>
            <Avatar name={profile.full_name} src={profile.avatar_url} size={38} />
          </Link>
        )}
      </div>
    </header>
  )
}
