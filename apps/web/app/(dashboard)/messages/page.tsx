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
import { MessageSquare, Users } from 'lucide-react'

async function getMessagesData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return { conference: null, rooms: [], messages: [] }
  }

  const conferenceId = conferences[0].id

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('id, name, room_type')
    .eq('conference_id', conferenceId)

  const roomIds = rooms?.map((r) => r.id) || []

  const { data: messages } =
    roomIds.length > 0
      ? await supabase
          .from('messages')
          .select(
            'id, content, created_at, sender:profiles(full_name), room:chat_rooms(name, room_type)'
          )
          .in('room_id', roomIds)
          .order('created_at', { ascending: false })
          .limit(20)
      : { data: [] }

  return { conference: conferences[0], rooms: rooms || [], messages: messages || [] }
}

export default async function MessagesPage() {
  const { conference, rooms, messages } = await getMessagesData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/dashboard/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Recent chat activity for {conference.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Rooms</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Messages</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Messages</CardTitle>
          <CardDescription>Most recent messages across chat rooms.</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {msg.sender?.full_name || 'Attendee'}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {msg.content}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Room: {msg.room?.name || msg.room?.room_type || 'General'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
