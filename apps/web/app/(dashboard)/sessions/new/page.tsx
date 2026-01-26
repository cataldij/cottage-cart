import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

async function getSessionFormData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (!conferences || conferences.length === 0) {
    return { conference: null, tracks: [], rooms: [] }
  }

  const conferenceId = conferences[0].id

  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  return { conference: conferences[0], tracks: tracks || [], rooms: rooms || [] }
}

async function createSessionAction(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    redirect('/dashboard/conferences')
  }

  const conferenceId = conferences[0].id

  const payload = {
    conference_id: conferenceId,
    title: String(formData.get('title') || '').trim(),
    description: String(formData.get('description') || '').trim() || null,
    session_type: String(formData.get('session_type') || 'talk'),
    track_id: formData.get('track_id') ? String(formData.get('track_id')) : null,
    room_id: formData.get('room_id') ? String(formData.get('room_id')) : null,
    start_time: String(formData.get('start_time') || ''),
    end_time: String(formData.get('end_time') || ''),
    max_attendees: formData.get('max_attendees')
      ? Number(formData.get('max_attendees'))
      : null,
    requires_registration: formData.get('requires_registration') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    livestream_url: String(formData.get('livestream_url') || '').trim() || null,
    replay_url: String(formData.get('replay_url') || '').trim() || null,
    slides_url: String(formData.get('slides_url') || '').trim() || null,
  }

  const { error } = await supabase.from('sessions').insert(payload)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/dashboard/sessions')
}

export default async function NewSessionPage() {
  const { conference, tracks, rooms } = await getSessionFormData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Session</h1>
          <p className="text-muted-foreground">Create a conference first.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Session</h1>
          <p className="text-muted-foreground">
            Add a session to {conference.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/sessions">Back to Sessions</Link>
        </Button>
      </div>

      <form action={createSessionAction} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              Core info attendees will see in the schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <input
                name="title"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Session type</label>
              <select
                name="session_type"
                defaultValue="talk"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="keynote">Keynote</option>
                <option value="talk">Talk</option>
                <option value="panel">Panel</option>
                <option value="workshop">Workshop</option>
                <option value="networking">Networking</option>
                <option value="break">Break</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Track</label>
              <select
                name="track_id"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No track</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Manage tracks in the Sessions page.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room</label>
              <select
                name="room_id"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>When does this session happen?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start time</label>
              <input
                name="start_time"
                type="datetime-local"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End time</label>
              <input
                name="end_time"
                type="datetime-local"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>Feature and access settings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="requires_registration" />
                Registration required
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_featured" />
                Featured session
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max attendees</label>
              <input
                name="max_attendees"
                type="number"
                min="0"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Livestream URL</label>
              <input
                name="livestream_url"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Replay URL</label>
              <input
                name="replay_url"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Slides URL</label>
              <input
                name="slides_url"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/sessions">Cancel</Link>
          </Button>
          <Button type="submit">Create Session</Button>
        </div>
      </form>
    </div>
  )
}
