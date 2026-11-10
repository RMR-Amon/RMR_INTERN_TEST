import { memo, useState, type CSSProperties } from 'react'
import { cn } from '@/utils/cn'
import { initials } from '@/utils/format'
import styles from './Avatar.module.scss'

const GRADIENTS = [
  'linear-gradient(135deg, #22d3ee, #6366f1)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #22d3ee)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #6366f1, #a855f7)',
]

const hash = (value: string) => Array.from(value).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7)

interface AvatarProps {
  name: string
  src?: string | null
  size?: number
  ring?: boolean
  className?: string
}

export const Avatar = memo(function Avatar({ name, src, size = 40, ring, className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const style = {
    '--size': `${size}px`,
    '--avatar-bg': GRADIENTS[hash(name) % GRADIENTS.length],
  } as CSSProperties

  return (
    <span className={cn(styles.avatar, ring && styles.ring, className)} style={style} aria-hidden>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        initials(name)
      )}
    </span>
  )
})
