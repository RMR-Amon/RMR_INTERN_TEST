import { useId, type CSSProperties } from 'react'
import styles from './RangeField.module.scss'

interface RangeFieldProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}

export function RangeField({ label, unit, value, min, max, step = 1, onChange }: RangeFieldProps) {
  const id = useId()
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
  return (
    <div className={styles.field}>
      <div className={styles.head}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span className={styles.value}>
          {value}
          <small>{unit}</small>
        </span>
      </div>
      <input
        id={id}
        type="range"
        className={styles.range}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` } as CSSProperties}
      />
      <div className={styles.scale} aria-hidden>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
