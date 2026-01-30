import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ChatInterface } from '@/components/chat'

async function getMessagesData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's first conference
  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return { conference: null, rooms: [] }
  }

  const conferenceId = conferences[0].id

  // Get chat rooms for this conference
  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('id, name, room_type')
    .eq('conference_id', conferenceId)
    .order('created_at', { ascending: true })

  // If no rooms exist, create a default "general" room
  if (!rooms || rooms.length === 0) {
    const { data: newRoom } = await supabase
      .from('chat_rooms')
      .insert({
        conference_id: conferenceId,
        name: 'general',
        room_type: 'conference',
        is_public: true,
      })
      .select('id, name, room_type')
      .single()

    if (newRoom) {
      // Add the creator as a member of this room
      await supabase.from('chat_room_members').insert({
        room_id: newRoom.id,
        user_id: user.id,
      })

      return { conference: conferences[0], rooms: [newRoom] }
    }
  }

  return { conference: conferences[0], rooms: rooms || [] }
}

export default async function MessagesPage() {
  const { conference, rooms } = await getMessagesData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Create a conference first to start chatting.
          </p>
        </div>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Chat with attendees for {conference.name}
        </p>
      </div>

      <ChatInterface
        conferenceId={conference.id}
        conferenceName={conference.name}
        initialRooms={rooms}
      />
    </div>
  )
}
