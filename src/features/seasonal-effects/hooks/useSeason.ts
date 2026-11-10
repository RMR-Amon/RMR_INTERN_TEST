import { useEffect, useState } from 'react'
import { usePreferencesStore } from '@/store/preferencesStore'
import type { Season } from '@/types'
import { getSeasonForDate } from '../lib/season'

/** Current season (auto from local date, or user override). Re-checks hourly. */
export const useSeason = (): { season: Season; autoSeason: Season } => {
  const override = usePreferencesStore((s) => s.seasonOverride)
  const [autoSeason, setAutoSeason] = useState<Season>(() => getSeasonForDate())

  useEffect(() => {
    const id = window.setInterval(() => setAutoSeason(getSeasonForDate()), 60 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [])

  return { season: override === 'auto' ? autoSeason : override, autoSeason }
}
