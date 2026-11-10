import { motion } from 'framer-motion'
import { useId, type CSSProperties } from 'react'
import { cn } from '@/utils/cn'
import styles from './StatisticsChart.module.scss'

export interface ChartDatum {
  label: string
  value: number
  /** tooltip text; defaults to value */
  tooltip?: string
  highlight?: boolean
}

interface StatisticsChartProps {
  data: ChartDatum[]
  type?: 'bar' | 'line'
  height?: number
  /** fixed max (e.g. 100 for percentages) */
  max?: number
  ariaLabel: string
}

/**
 * Lightweight dependency-free chart (bars or line) built with CSS + SVG.
 * Responsive by design: bars are flex items, the line uses a scalable viewBox.
 */
export function StatisticsChart({ data, type = 'bar', height = 180, max, ariaLabel }: StatisticsChartProps) {
  const peak = Math.max(max ?? 0, ...data.map((d) => d.value), 1)
  const gradientId = useId()

  return (
    <figure className={styles.chart} role="img" aria-label={ariaLabel}>
      <div className={styles.plot} style={{ '--h': `${height}px` } as CSSProperties}>
        <div className={styles.grid} aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        {type === 'bar' ? <Bars data={data} peak={peak} /> : <Line data={data} peak={peak} gradientId={gradientId} />}
      </div>
      <div className={styles.labels} aria-hidden>
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`} className={cn(d.highlight && styles.labelActive)}>
            {d.label}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.label}: ${d.tooltip ?? d.value}`).join(', ')}
      </figcaption>
    </figure>
  )
}

function Bars({ data, peak }: { data: ChartDatum[]; peak: number }) {
  return (
    <div className={styles.bars}>
      {data.map((d, i) => {
        const pct = (d.value / peak) * 100
        return (
          <div key={`${d.label}-${i}`} className={styles.barCol} style={{ '--top': `${pct}%` } as CSSProperties}>
            <span className={styles.tooltip}>{d.tooltip ?? d.value}</span>
            <motion.div
              className={cn(styles.bar, d.value === 0 && styles.barEmpty, d.highlight && styles.highlight)}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 2)}%` }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        )
      })}
    </div>
  )
}

function Line({ data, peak, gradientId }: { data: ChartDatum[]; peak: number; gradientId: string }) {
  if (data.length === 0) return null
  const step = data.length > 1 ? 100 / (data.length - 1) : 0
  const points = data.map((d, i) => ({
    x: data.length > 1 ? i * step : 50,
    y: 100 - (d.value / peak) * 92 - 4,
    d,
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${points[points.length - 1].x},100 L${points[0].x},100 Z`

  return (
    <>
      <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={path}
          className={styles.line}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {points.map((p, i) => (
        <span key={i} className={styles.point} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <span className={styles.tooltip}>{p.d.tooltip ?? p.d.value}</span>
        </span>
      ))}
    </>
  )
}
