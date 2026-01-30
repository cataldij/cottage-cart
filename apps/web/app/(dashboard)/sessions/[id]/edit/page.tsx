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
import { Trash2 } from 'lucide-react'

async function getSessionData(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (!session) {
    redirect('/dashboard/sessions')
  }

  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('conference_id', session.conference_id)
    .order('sort_order')

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('conference_id', session.conference_id)
    .order('sort_order')

  return { session, tracks: tracks || [], rooms: rooms || [] }
}

async function updateSessionAction(id: string, formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const payload = {
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

  const { error } = await supabase.from('sessions').update(payload).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/dashboard/sessions')
}

async function deleteSessionAction(id: string) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('sessions').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/dashboard/sessions')
}

export default async function EditSessionPage({
  params,
}: {
  params: { id: string }
}) {
  const { session, tracks, rooms } = await getSessionData(params.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Session</h1>
          <p className="text-muted-foreground">Update session details.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/sessions">Back</Link>
          </Button>
          <form action={deleteSessionAction.bind(null, session.id)}>
            <Button variant="destructive" type="submit">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <form action={updateSessionAction.bind(null, session.id)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Core info for this session.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <input
                name="title"
                defaultValue={session.title}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={session.description || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Session type</label>
              <select
                name="session_type"
                defaultValue={session.session_type}
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
                defaultValue={session.track_id || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No track</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room</label>
              <select
                name="room_id"
                defaultValue={session.room_id || ''}
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
            <CardDescription>Update timing and access.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start time</label>
              <input
                name="start_time"
                type="datetime-local"
                defaultValue={session.start_time?.slice(0, 16)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End time</label>
              <input
                name="end_time"
                type="datetime-local"
                defaultValue={session.end_time?.slice(0, 16)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max attendees</label>
              <input
                name="max_attendees"
                type="number"
                min="0"
                defaultValue={session.max_attendees || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="requires_registration"
                  defaultChecked={session.requires_registration}
                />
                Registration required
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={session.is_featured}
                />
                Featured session
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Optional streaming and resources.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Livestream URL</label>
              <input
                name="livestream_url"
                defaultValue={session.livestream_url || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Replay URL</label>
              <input
                name="replay_url"
                defaultValue={session.replay_url || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Slides URL</label>
              <input
                name="slides_url"
                defaultValue={session.slides_url || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/sessions">Cancel</Link>
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  )
}
