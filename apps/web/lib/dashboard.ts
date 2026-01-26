import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getUserOrRedirect() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return { supabase, user }
}

export async function getPrimaryConference(userId: string) {
  const supabase = await createClient()
  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name, slug')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  return conferences?.[0] ?? null
}
