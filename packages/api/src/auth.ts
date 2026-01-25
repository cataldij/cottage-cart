// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { getSupabase, Profile } from './client'
import { z } from 'zod'

// Validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string()).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional(),
  language: z.string().optional(),
  networkingEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// Auth functions
export async function signUp(input: SignUpInput) {
  const supabase = getSupabase()
  const validated = signUpSchema.parse(input)

  const { data, error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: {
        full_name: validated.fullName,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signIn(input: SignInInput) {
  const supabase = getSupabase()
  const validated = signInSchema.parse(input)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  })

  if (error) throw error
  return data
}

export async function signInWithOAuth(provider: 'google' | 'apple' | 'linkedin_oidc') {
  const supabase = getSupabase()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = getSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : undefined,
  })

  if (error) throw error
  return data
}

export async function updatePassword(newPassword: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}

// Session and user
export async function getSession() {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getUser()
  if (!user) return null
  return getProfile(user.id)
}

export async function updateProfile(userId: string, input: ProfileUpdateInput) {
  const supabase = getSupabase()
  const validated = profileUpdateSchema.parse(input)

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: validated.fullName,
      company: validated.company,
      job_title: validated.jobTitle,
      bio: validated.bio,
      interests: validated.interests,
      linkedin_url: validated.linkedinUrl || null,
      twitter_url: validated.twitterUrl || null,
      website_url: validated.websiteUrl || null,
      timezone: validated.timezone,
      language: validated.language,
      networking_enabled: validated.networkingEnabled,
      push_enabled: validated.pushEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAvatar(userId: string, file: File) {
  const supabase = getSupabase()

  // Upload to storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Update profile
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Auth state listener
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabase()
  return supabase.auth.onAuthStateChange(callback)
}
