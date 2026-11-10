import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { usePreferencesStore, type SeasonalIntensity } from '@/store/preferencesStore'
import { cn } from '@/utils/cn'
import { useSeason } from '../hooks/useSeason'
import { SeasonalEngine } from '../lib/engine'
import { BlossomBranch } from './BlossomBranch'
import styles from './SeasonalEffects.module.scss'

const INTENSITY: Record<SeasonalIntensity, number> = { low: 0.5, medium: 1, high: 1.6 }

/**
 * Global decorative seasonal layer (fixed, pointer-events: none).
 * Becomes much more subtle while a test is running.
 */
export function SeasonalEffects() {
  const enabled = usePreferencesStore((s) => s.seasonalEnabled)
  const intensity = usePreferencesStore((s) => s.seasonalIntensity)
  const theme = usePreferencesStore((s) => s.theme)
  const reducedMotion = usePrefersReducedMotion()
  const { season } = useSeason()
  const { pathname } = useLocation()
  const inTest = pathname.startsWith('/tests/session')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SeasonalEngine | null>(null)

  const animate = enabled && !reducedMotion
  const density = INTENSITY[intensity] * (inTest ? 0.3 : 1)
  const opacity = inTest ? 0.45 : 1

  useEffect(() => {
    if (!animate || !canvasRef.current) return
    let engine: SeasonalEngine
    try {
      engine = new SeasonalEngine(canvasRef.current, { season, theme, density, opacity })
    } catch {
      return
    }
    engineRef.current = engine
    if (!document.hidden) engine.start()
    return () => {
      engine.destroy()
      engineRef.current = null
    }
    // the engine is created once per enable; options are pushed via update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate])

  useEffect(() => {
    engineRef.current?.update({ season, theme, density, opacity })
  }, [season, theme, density, opacity])

  if (!enabled) return null

  return (
    <>
      {/* Atmosphere (glow, blossom branch, sun rays) sits BEHIND the content */}
      <div className={cn(styles.atmosphereLayer, inTest && styles.subtle)} aria-hidden data-season={season}>
        <div className={cn(styles.atmosphere, styles[season])}>
          {season === 'spring' && <BlossomBranch className={styles.branch} />}
          {season === 'summer' && <div className={styles.sun} />}
        </div>
      </div>
      {/* Falling particles float ABOVE the content but never catch clicks */}
      {animate && (
        <div className={cn(styles.layer, inTest && styles.subtle)} aria-hidden>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
      )}
    </>
  )
}
