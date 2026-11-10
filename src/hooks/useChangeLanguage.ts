import { profileApi } from '@/features/profile/api/profileApi'
import { useAuthStore } from '@/store/authStore'
import { usePreferencesStore } from '@/store/preferencesStore'
import type { Language } from '@/types'

/** Changes language instantly and persists it to localStorage + the user's profile. */
export const useChangeLanguage = () => {
  const setLanguage = usePreferencesStore((s) => s.setLanguage)
  return (language: Language) => {
    setLanguage(language)
    const { profile, setProfile } = useAuthStore.getState()
    if (profile && profile.language !== language) {
      setProfile({ ...profile, language })
      void profileApi.setLanguage(profile.id, language)
    }
  }
}
