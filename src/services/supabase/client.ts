import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Public project credentials. The publishable key is safe to ship to the
 * browser — every sensitive operation is protected by RLS and SECURITY DEFINER
 * functions in the DB. Env variables (if set) take priority.
 */
const DEFAULT_URL = 'https://yzpegxecjnkaxjptccsm.supabase.co'
const DEFAULT_KEY = 'sb_publishable_z7hPL4xYxQnZU4BNlZzleQ_6q2BwCJs'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_URL
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_KEY

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
