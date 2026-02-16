import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@cottage-cart/api'

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowser() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return supabaseInstance
}

// Auth functions using browser client
export async function signInBrowser(email: string, password: string) {
  const supabase = getSupabaseBrowser()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUpBrowser(email: string, password: string, fullName: string) {
  const supabase = getSupabaseBrowser()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  if (error) throw error
  return data
}

export async function signOutBrowser() {
  const supabase = getSupabaseBrowser()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
