import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConferenceEditorClient } from './client'

async function getConference(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: conference } = await supabase
    .from('conferences')
    .select('*')
    .eq('id', id)
    .single()

  if (!conference) {
    redirect('/conferences')
  }

  return { conference, userId: user.id }
}

export default async function ConferenceEditPage({
  params,
}: {
  params: { id: string }
}) {
  const { conference } = await getConference(params.id)

  // Map database conference to editor format
  const initialConference = {
    id: conference.id,
    slug: conference.slug,
    name: conference.name,
    tagline: conference.tagline || '',
    description: conference.description || '',
    startDate: conference.start_date?.split('T')[0] || '',
    endDate: conference.end_date?.split('T')[0] || '',
    timezone: conference.timezone || 'America/New_York',
    venueName: conference.venue_name || '',
    venueAddress: conference.venue_address || '',
    logoUrl: conference.logo_url || null,
    bannerUrl: conference.banner_url || null,
    primaryColor: conference.primary_color || '#2563eb',
    secondaryColor: conference.secondary_color || '#8b5cf6',
    websiteUrl: conference.website_url || '',
    isPublic: conference.is_public ?? true,
    isHybrid: conference.is_hybrid ?? false,
    registrationOpen: conference.registration_open ?? true,
    maxAttendees: conference.max_attendees || null,
  }

  return (
    <ConferenceEditorClient
      conferenceId={params.id}
      initialConference={initialConference}
    />
  )
}
