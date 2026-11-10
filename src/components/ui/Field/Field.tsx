import { Eye, EyeOff } from 'lucide-react'
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/utils/cn'
import styles from './Field.module.scss'

interface FieldWrapperProps {
  id: string
  label?: ReactNode
  hint?: ReactNode
  error?: string | null
  children: ReactNode
  className?: string
}

function FieldWrapper({ id, label, hint, error, children, className }: FieldWrapperProps) {
  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className={styles.hint} id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

const describedBy = (id: string, error?: string | null, hint?: ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined

// ---------------------------------------------------------------------------
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string | null
  icon?: ReactNode
  wrapperClassName?: string
  /** For password inputs: labels for the visibility toggle */
  toggleLabels?: { show: string; hide: string }
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, id, className, wrapperClassName, type = 'text', toggleLabels, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <FieldWrapper id={inputId} label={label} hint={hint} error={error} className={wrapperClassName}>
      <div className={styles.control}>
        {icon && <span className={styles.leadingIcon}>{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && visible ? 'text' : type}
          className={cn(
            styles.input,
            icon ? styles.withIcon : undefined,
            isPassword && styles.withAction,
            error && styles.invalid,
            className,
          )}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...rest}
        />
        {isPassword && (
          <span className={styles.trailing}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? toggleLabels?.hide ?? 'Hide' : toggleLabels?.show ?? 'Show'}
            >
              {visible ? <EyeOff /> : <Eye />}
            </button>
          </span>
        )}
      </div>
    </FieldWrapper>
  )
})

// ---------------------------------------------------------------------------
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string | null
  mono?: boolean
  wrapperClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, mono, className, wrapperClassName, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldWrapper id={inputId} label={label} hint={hint} error={error} className={wrapperClassName}>
      <textarea
        ref={ref}
        id={inputId}
        className={cn(styles.input, mono && styles.mono, error && styles.invalid, className)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        {...rest}
      />
    </FieldWrapper>
  )
})

// ---------------------------------------------------------------------------
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: string | null
  options: { value: string; label: string }[]
  wrapperClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, id, options, className, wrapperClassName, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldWrapper id={inputId} label={label} hint={hint} error={error} className={wrapperClassName}>
      <select
        ref={ref}
        id={inputId}
        className={cn(styles.input, error && styles.invalid, className)}
        aria-invalid={Boolean(error) || undefined}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
})
