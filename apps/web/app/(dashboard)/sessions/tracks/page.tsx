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
import { Plus, Trash2 } from 'lucide-react'

async function getTracksData() {
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
    return { conference: null, tracks: [] }
  }

  const conferenceId = conferences[0].id

  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  return { conference: conferences[0], tracks: tracks || [] }
}

async function createTrackAction(formData: FormData) {
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

  const payload = {
    conference_id: conferences[0].id,
    name: String(formData.get('name') || '').trim(),
    description: String(formData.get('description') || '').trim() || null,
    color: String(formData.get('color') || '#2563eb'),
    sort_order: Number(formData.get('sort_order') || 0),
  }

  const { error } = await supabase.from('tracks').insert(payload)
  if (error) throw new Error(error.message)

  redirect('/dashboard/sessions/tracks')
}

async function deleteTrackAction(id: string) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('tracks').delete().eq('id', id)
  if (error) throw new Error(error.message)

  redirect('/dashboard/sessions/tracks')
}

export default async function TracksPage() {
  const { conference, tracks } = await getTracksData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Tracks</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
          <p className="text-muted-foreground">
            Manage tracks for {conference.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/sessions">Back to Sessions</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Track</CardTitle>
          <CardDescription>Add a category for sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTrackAction} className="grid gap-4 md:grid-cols-4">
            <input
              name="name"
              placeholder="Track name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
              required
            />
            <input
              name="color"
              type="color"
              defaultValue="#2563eb"
              className="h-10 w-full rounded-md border border-input bg-background px-2 py-1"
            />
            <input
              name="sort_order"
              type="number"
              min="0"
              placeholder="Order"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <textarea
              name="description"
              rows={2}
              placeholder="Optional description"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-4"
            />
            <div className="md:col-span-4">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Track
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Tracks</CardTitle>
          <CardDescription>{tracks.length} tracks</CardDescription>
        </CardHeader>
        <CardContent>
          {tracks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracks yet.</p>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: track.color || '#2563eb' }}
                    />
                    <div>
                      <p className="font-medium">{track.name}</p>
                      {track.description && (
                        <p className="text-xs text-muted-foreground">
                          {track.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <form action={deleteTrackAction.bind(null, track.id)}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
