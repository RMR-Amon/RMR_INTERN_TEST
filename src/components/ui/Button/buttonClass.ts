import { cn } from '@/utils/cn'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  iconOnly?: boolean
  loading?: boolean
}

export const buttonClass = ({
  variant = 'primary',
  size = 'md',
  fullWidth,
  iconOnly,
  loading,
}: ButtonStyleProps, extra?: string) =>
  cn(
    styles.button,
    styles[variant],
    size !== 'md' && styles[size],
    fullWidth && styles.full,
    iconOnly && styles.icon,
    loading && styles.loading,
    extra,
  )

export { styles as buttonStyles }
