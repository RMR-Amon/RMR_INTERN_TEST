import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { buttonClass, buttonStyles, type ButtonStyleProps } from './buttonClass'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  icon?: ReactNode
  iconRight?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, iconOnly, loading, icon, iconRight, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass({ variant, size, fullWidth, iconOnly, loading }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={buttonStyles.spinner} aria-hidden /> : icon}
      {children && <span className={buttonStyles.content}>{children}</span>}
      {!loading && iconRight}
    </button>
  )
})

interface LinkButtonProps extends LinkProps, Omit<ButtonStyleProps, 'loading'> {
  icon?: ReactNode
  iconRight?: ReactNode
}

export function LinkButton({ variant, size, fullWidth, iconOnly, icon, iconRight, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClass({ variant, size, fullWidth, iconOnly }, className)} {...rest}>
      {icon}
      {children && <span>{children}</span>}
      {iconRight}
    </Link>
  )
}
