import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { authApi } from '@/features/auth/api/authApi'
import { profileApi } from '@/features/profile/api/profileApi'
import { supabase } from '@/services/supabase/client'
import type { Profile } from '@/types'
import { getDictionary } from '@/locales'
import { usePreferencesStore } from './preferencesStore'
import { toast } from './toastStore'

type AuthStatus = 'loading' | 'authenticated' | 'guest'

interface AuthState {
  status: AuthStatus
  session: Session | null
  profile: Profile | null
  /** true right after a PASSWORD_RECOVERY link was opened */
  recoveryMode: boolean
  initialized: boolean
  init: () => () => void
  /** Apply a session immediately (used right after sign-in to avoid redirect races). */
  hydrate: (session: Session | null) => Promise<Profile | null>
  refreshProfile: () => Promise<void>
  setProfile: (profile: Profile) => void
  signOut: () => Promise<void>
  clearRecovery: () => void
}

const loadProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const profile = await profileApi.getById(userId)
    // Profile language is the source of truth for signed-in users
    if (profile && profile.language !== usePreferencesStore.getState().language) {
      usePreferencesStore.getState().setLanguage(profile.language)
    }
    return profile
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  session: null,
  profile: null,
  recoveryMode: false,
  initialized: false,

  init: () => {
    if (get().initialized) return () => undefined
    set({ initialized: true })

    const apply = (session: Session | null) => get().hydrate(session)

    void supabase.auth.getSession().then(({ data }) => apply(data.session))

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') set({ recoveryMode: true })
      if (event === 'INITIAL_SESSION') return
      if (event === 'TOKEN_REFRESHED') {
        set({ session })
        return
      }
      // Defer to avoid running Supabase calls inside the auth callback lock
      window.setTimeout(() => void apply(session), 0)
    })

    return () => data.subscription.unsubscribe()
  },

  hydrate: async (session) => {
    if (!session) {
      set({ session: null, profile: null, status: 'guest' })
      return null
    }
    // Skip refetch if this exact user is already loaded
    const current = get()
    if (current.status === 'authenticated' && current.profile?.id === session.user.id) {
      set({ session })
      return current.profile
    }
    set({ session })
    const profile = await loadProfile(session.user.id)
    if (profile?.is_blocked) {
      await authApi.signOut()
      set({ session: null, profile: null, status: 'guest' })
      toast.error(getDictionary().auth.blocked)
      return null
    }
    set({ profile, status: profile ? 'authenticated' : 'guest' })
    return profile
  },

  refreshProfile: async () => {
    const userId = get().session?.user.id
    if (!userId) return
    const profile = await loadProfile(userId)
    if (profile) set({ profile })
  },

  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    await authApi.signOut()
    set({ session: null, profile: null, status: 'guest', recoveryMode: false })
  },

  clearRecovery: () => set({ recoveryMode: false }),
}))

/** Selectors */
export const useProfile = () => useAuthStore((s) => s.profile)
export const useIsAdmin = () => useAuthStore((s) => s.profile?.role === 'admin')
