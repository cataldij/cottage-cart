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

async function getRoomsData() {
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
    return { conference: null, rooms: [] }
  }

  const conferenceId = conferences[0].id

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  return { conference: conferences[0], rooms: rooms || [] }
}

async function createRoomAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    floor: String(formData.get('floor') || '').trim() || null,
    building: String(formData.get('building') || '').trim() || null,
    has_livestream: formData.get('has_livestream') === 'on',
    sort_order: Number(formData.get('sort_order') || 0),
  }

  const { error } = await supabase.from('rooms').insert(payload)
  if (error) throw new Error(error.message)

  redirect('/dashboard/sessions/rooms')
}

async function deleteRoomAction(id: string) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('rooms').delete().eq('id', id)
  if (error) throw new Error(error.message)

  redirect('/dashboard/sessions/rooms')
}

export default async function RoomsPage() {
  const { conference, rooms } = await getRoomsData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Rooms</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Manage rooms for {conference.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/sessions">Back to Sessions</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Room</CardTitle>
          <CardDescription>Add a location or stage.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createRoomAction} className="grid gap-4 md:grid-cols-4">
            <input
              name="name"
              placeholder="Room name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
              required
            />
            <input
              name="capacity"
              type="number"
              min="0"
              placeholder="Capacity"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              name="sort_order"
              type="number"
              min="0"
              placeholder="Order"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              name="floor"
              placeholder="Floor"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              name="building"
              placeholder="Building"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
              <input type="checkbox" name="has_livestream" />
              Livestream enabled
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Optional description"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-4"
            />
            <div className="md:col-span-4">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Rooms</CardTitle>
          <CardDescription>{rooms.length} rooms</CardDescription>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms yet.</p>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {room.capacity ? `${room.capacity} capacity` : 'No capacity set'}
                      {room.floor ? ` - Floor ${room.floor}` : ''}
                      {room.building ? ` - ${room.building}` : ''}
                    </p>
                  </div>
                  <form action={deleteRoomAction.bind(null, room.id)}>
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
