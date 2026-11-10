import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { useI18n } from '@/locales'
import { cn } from '@/utils/cn'
import { Button } from '../Button/Button'
import styles from './Controls.module.scss'

// ---------------------------------------------------------------------------
interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  hint?: ReactNode
  disabled?: boolean
}

export function Switch({ checked, onChange, label, hint, disabled }: SwitchProps) {
  const id = useId()
  return (
    <div className={styles.switchRow} onClick={() => !disabled && onChange(!checked)}>
      <span className={styles.switchText}>
        <span className={styles.switchLabel} id={`${id}-label`}>
          {label}
        </span>
        {hint && <span className={styles.switchHint}>{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        className={styles.switch}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          onChange(!checked)
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  fullWidth?: boolean
  ariaLabel: string
}

export function SegmentedControl<T extends string>({ value, options, onChange, fullWidth, ariaLabel }: SegmentedControlProps<T>) {
  const layoutId = useId()
  return (
    <div className={cn(styles.segmented, fullWidth && styles.full)} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={cn(styles.segment, active && styles.segmentActive)}
            onClick={() => onChange(option.value)}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className={styles.segmentPill}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className={styles.segmentLabel}>
              {option.icon}
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const { t, f } = useI18n()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <span>{f(t.common.pageOf, { page: page + 1, pages })}</span>
      <div className={styles.pages}>
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          icon={<ChevronLeft />}
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          aria-label={t.common.previous}
        />
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          icon={<ChevronRight />}
          disabled={page >= pages - 1}
          onClick={() => onChange(page + 1)}
          aria-label={t.common.next}
        />
      </div>
    </nav>
  )
}
