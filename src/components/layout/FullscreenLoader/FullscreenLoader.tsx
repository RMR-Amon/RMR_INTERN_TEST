import { LogoMark } from '@/components/shared'
import styles from './FullscreenLoader.module.scss'

export function FullscreenLoader() {
  return (
    <div className={styles.screen} role="status" aria-label="Loading">
      <LogoMark className={styles.mark} />
      <div className={styles.bar}>
        <span />
      </div>
    </div>
  )
}
