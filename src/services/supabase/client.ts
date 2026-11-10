import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when the public Supabase env variables are present. */
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('your-project-ref'))

/**
 * Browser Supabase client. Uses ONLY the public anon key — every sensitive
 * operation is protected by RLS and SECURITY DEFINER functions in the DB.
 */
export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
