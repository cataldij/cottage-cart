import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { AgendaBoard } from '@/components/dashboard/agenda-board'

async function getAgendaData() {
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
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return { conference: null, rooms: [], sessions: [] }
  }

  const conferenceId = conferences[0].id

  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, name')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, start_time, end_time, room_id, track:tracks(name, color)')
    .eq('conference_id', conferenceId)
    .order('start_time', { ascending: true })

  return {
    conference: conferences[0],
    rooms: rooms || [],
    sessions: sessions || [],
  }
}

export default async function AgendaPage() {
  const { conference, rooms, sessions } = await getAgendaData()

  if (!conference) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Builder</h1>
          <p className="text-muted-foreground">
            Create a conference first to arrange sessions.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Builder</h1>
          <p className="text-muted-foreground">
            Drag sessions between rooms for {conference.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/sessions">Back to Sessions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/sessions/rooms">Manage Rooms</Link>
          </Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-2xl border bg-white/70 p-8 text-center">
          <p className="text-lg font-semibold">No rooms yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add rooms to start arranging your agenda.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/sessions/rooms">Create Rooms</Link>
          </Button>
        </div>
      ) : (
        <AgendaBoard
          rooms={rooms}
          sessions={sessions}
          conferenceName={conference.name}
        />
      )}
    </div>
  )
}
