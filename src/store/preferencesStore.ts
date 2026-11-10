import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Language, Season, Theme } from '@/types'

export type SeasonalIntensity = 'low' | 'medium' | 'high'
export type SeasonOverride = 'auto' | Season

interface PreferencesState {
  language: Language
  theme: Theme
  seasonalEnabled: boolean
  seasonalIntensity: SeasonalIntensity
  seasonOverride: SeasonOverride
  sidebarCollapsed: boolean
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSeasonalEnabled: (enabled: boolean) => void
  setSeasonalIntensity: (intensity: SeasonalIntensity) => void
  setSeasonOverride: (season: SeasonOverride) => void
  toggleSidebar: () => void
}

/** UI preferences persisted in localStorage (language is also synced to the profile). */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'uz',
      theme: 'dark',
      seasonalEnabled: true,
      seasonalIntensity: 'medium',
      seasonOverride: 'auto',
      sidebarCollapsed: false,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setSeasonalEnabled: (seasonalEnabled) => set({ seasonalEnabled }),
      setSeasonalIntensity: (seasonalIntensity) => set({ seasonalIntensity }),
      setSeasonOverride: (seasonOverride) => set({ seasonOverride }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'rmr-preferences',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
