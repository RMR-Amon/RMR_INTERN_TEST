import { useId } from 'react'
import styles from './Logo.module.scss'

export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset=".55" stopColor="#6366f1" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0b1224" />
      <rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke={`url(#${id})`} strokeWidth="2.5" />
      <path
        d="M20 22l-8 10 8 10M44 22l8 10-8 10M36 18l-8 28"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className={styles.logo}>
      <LogoMark className={styles.mark} />
      {!compact && (
        <span className={styles.text}>
          <span className={styles.name}>R_M_R</span>
          <span className={styles.tagline}>Test for intern</span>
        </span>
      )}
    </span>
  )
}
