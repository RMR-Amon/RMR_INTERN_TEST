import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useId, type CSSProperties } from 'react'
import styles from './RadialProgress.module.scss'

interface RadialProgressProps {
  value: number
  size?: number
  stroke?: number
  caption?: string
}

/** Animated circular score indicator (0–100). */
export function RadialProgress({ value, size = 168, stroke = 12, caption }: RadialProgressProps) {
  const id = useId()
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = useMotionValue(0)
  const dashOffset = useTransform(progress, (v) => circumference - (v / 100) * circumference)
  const label = useTransform(progress, (v) => `${Math.round(v)}%`)

  useEffect(() => {
    const controls = animate(progress, Math.max(0, Math.min(100, value)), { duration: 1.4, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, progress])

  return (
    <div className={styles.radial} style={{ '--size': `${size}px` } as CSSProperties} role="img" aria-label={`${Math.round(value)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset=".55" stopColor="#6366f1" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <motion.circle
          className={styles.value}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={`url(#${id})`}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className={styles.center}>
        <motion.span className={styles.number}>{label}</motion.span>
        {caption && <span className={styles.caption}>{caption}</span>}
      </div>
    </div>
  )
}
