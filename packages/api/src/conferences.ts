// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { getSupabase, Conference, ConferenceMember, Session, Track, Room } from './client'
import { z } from 'zod'

// Validation schemas
export const conferenceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  tagline: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string().default('UTC'),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  primaryColor: z.string().default('#2563eb'),
  isPublic: z.boolean().default(true),
  isHybrid: z.boolean().default(false),
  maxAttendees: z.number().optional(),
})

export type ConferenceInput = z.infer<typeof conferenceSchema>

// Conference with related data
export interface ConferenceWithDetails extends Conference {
  tracks: Track[]
  rooms: Room[]
  memberCount: number
}

// Fetch conferences
export async function getPublicConferences(): Promise<Conference[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('is_public', true)
    .order('start_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getUpcomingConferences(): Promise<Conference[]> {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('is_public', true)
    .gte('end_date', today)
    .order('start_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getConferenceBySlug(slug: string): Promise<ConferenceWithDetails | null> {
  const supabase = getSupabase()

  const { data: conference, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Get tracks
  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('conference_id', conference.id)
    .order('sort_order')

  // Get rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('conference_id', conference.id)
    .order('sort_order')

  // Get member count
  const { count } = await supabase
    .from('conference_members')
    .select('*', { count: 'exact', head: true })
    .eq('conference_id', conference.id)

  return {
    ...conference,
    tracks: tracks || [],
    rooms: rooms || [],
    memberCount: count || 0,
  }
}

export async function getConferenceById(id: string): Promise<Conference | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

// User's conferences (ones they're registered for)
export async function getUserConferences(userId: string): Promise<Conference[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conference_members')
    .select('conference:conferences(*)')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })

  if (error) throw error

  return data?.map(d => d.conference as Conference).filter(Boolean) || []
}

// Conference membership
export async function joinConference(conferenceId: string, userId: string, ticketType?: string): Promise<ConferenceMember> {
  const supabase = getSupabase()

  // Generate unique ticket code
  const ticketCode = `${conferenceId.slice(0, 8)}-${userId.slice(0, 8)}-${Date.now().toString(36)}`

  const { data, error } = await supabase
    .from('conference_members')
    .insert({
      conference_id: conferenceId,
      user_id: userId,
      role: 'attendee',
      ticket_type: ticketType || 'general',
      ticket_code: ticketCode,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConferenceMembership(conferenceId: string, userId: string): Promise<ConferenceMember | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conference_members')
    .select('*')
    .eq('conference_id', conferenceId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function checkInAttendee(ticketCode: string, checkedInBy: string): Promise<ConferenceMember> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conference_members')
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      checked_in_by: checkedInBy,
    })
    .eq('ticket_code', ticketCode)
    .select()
    .single()

  if (error) throw error
  return data
}

// Sessions
export async function getConferenceSessions(conferenceId: string): Promise<Session[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getSessionsByDate(conferenceId: string, date: string): Promise<Session[]> {
  const supabase = getSupabase()

  const startOfDay = `${date}T00:00:00Z`
  const endOfDay = `${date}T23:59:59Z`

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('conference_id', conferenceId)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

// Saved sessions (user's personal agenda)
export async function saveSession(userId: string, sessionId: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('saved_sessions')
    .insert({
      user_id: userId,
      session_id: sessionId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unsaveSession(userId: string, sessionId: string) {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('saved_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId)

  if (error) throw error
}

export async function getUserSavedSessions(userId: string, conferenceId: string): Promise<Session[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('saved_sessions')
    .select('session:sessions(*)')
    .eq('user_id', userId)

  if (error) throw error

  const sessions = data?.map(d => d.session as Session).filter(Boolean) || []
  return sessions.filter(s => s.conference_id === conferenceId)
}

// Tracks
export async function getConferenceTracks(conferenceId: string): Promise<Track[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  if (error) throw error
  return data || []
}

// Rooms
export async function getConferenceRooms(conferenceId: string): Promise<Room[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  if (error) throw error
  return data || []
}

// Conference creation (for organizers)
export async function createConference(input: ConferenceInput, createdBy: string): Promise<Conference> {
  const supabase = getSupabase()
  const validated = conferenceSchema.parse(input)

  const { data, error } = await supabase
    .from('conferences')
    .insert({
      name: validated.name,
      slug: validated.slug,
      tagline: validated.tagline,
      description: validated.description,
      start_date: validated.startDate,
      end_date: validated.endDate,
      timezone: validated.timezone,
      venue_name: validated.venueName,
      venue_address: validated.venueAddress,
      primary_color: validated.primaryColor,
      is_public: validated.isPublic,
      is_hybrid: validated.isHybrid,
      max_attendees: validated.maxAttendees,
      created_by: createdBy,
    })
    .select()
    .single()

  if (error) throw error

  // Auto-add creator as organizer
  await supabase.from('conference_members').insert({
    conference_id: data.id,
    user_id: createdBy,
    role: 'organizer',
  })

  return data
}
