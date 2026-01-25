// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single supabase client for the app
let supabaseInstance: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables')
    }
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  }
  return supabaseInstance
}

// For server-side usage with service role key
export function getSupabaseAdmin(): SupabaseClient<Database> {
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase admin environment variables')
  }
  return createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export types
export type { Database }
export type Tables = Database['public']['Tables']
export type Profile = Tables['profiles']['Row']
export type Conference = Tables['conferences']['Row']
export type ConferenceMember = Tables['conference_members']['Row']
export type Session = Tables['sessions']['Row']
export type Track = Tables['tracks']['Row']
export type Room = Tables['rooms']['Row']
export type SavedSession = Tables['saved_sessions']['Row']
export type Connection = Tables['connections']['Row']
export type Message = Tables['messages']['Row']
