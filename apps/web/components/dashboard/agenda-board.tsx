'use client'

import { useMemo, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { cn } from '@/lib/utils'

type Room = {
  id: string
  name: string
}

type Session = {
  id: string
  title: string
  start_time: string
  end_time: string
  room_id: string | null
  track?: { name: string; color: string | null } | null
}

type AgendaBoardProps = {
  rooms: Room[]
  sessions: Session[]
  conferenceName: string
}

export function AgendaBoard({ rooms, sessions, conferenceName }: AgendaBoardProps) {
  const [items, setItems] = useState<Session[]>(sessions)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, Session[]>()
    rooms.forEach((room) => map.set(room.id, []))
    map.set('unassigned', [])

    items.forEach((session) => {
      const key = session.room_id || 'unassigned'
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)?.push(session)
    })

    for (const [key, value] of map.entries()) {
      value.sort((a, b) => a.start_time.localeCompare(b.start_time))
      map.set(key, value)
    }

    return map
  }, [items, rooms])

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, sessionId: string) => {
    event.dataTransfer.setData('text/plain', sessionId)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, roomId: string | null) => {
    event.preventDefault()
    const sessionId = event.dataTransfer.getData('text/plain')
    if (!sessionId) return

    setIsUpdating(sessionId)
    const previous = items.find((session) => session.id === sessionId)
    if (!previous) return

    setItems((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, room_id: roomId } : session
      )
    )

    const supabase = getSupabaseBrowser()
    const { error } = await supabase
      .from('sessions')
      .update({ room_id: roomId })
      .eq('id', sessionId)

    if (error) {
      setItems((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, room_id: previous.room_id } : session
        )
      )
    }

    setIsUpdating(null)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda Builder</h1>
        <p className="text-muted-foreground">
          Drag sessions between rooms for {conferenceName}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <div className="rounded-lg border bg-white/70 p-4">
            <p className="text-sm font-semibold">Unassigned Sessions</p>
            <p className="text-xs text-muted-foreground">
              {grouped.get('unassigned')?.length || 0} sessions
            </p>
          </div>
          {rooms.map((room) => (
            <div key={room.id} className="rounded-lg border bg-white/70 p-4">
              <p className="text-sm font-semibold">{room.name}</p>
              <p className="text-xs text-muted-foreground">
                {grouped.get(room.id)?.length || 0} sessions
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {[{ id: 'unassigned', name: 'Unassigned' } as Room, ...rooms].map((room) => (
            <div key={room.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{room.name}</h2>
                <span className="text-xs text-muted-foreground">
                  {grouped.get(room.id)?.length || 0} sessions
                </span>
              </div>
              <div
                className="min-h-[120px] rounded-2xl border border-dashed border-muted-foreground/30 bg-white/60 p-4"
                onDrop={(event) => handleDrop(event, room.id === 'unassigned' ? null : room.id)}
                onDragOver={handleDragOver}
              >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {(grouped.get(room.id) || []).map((session) => (
                    <div
                      key={session.id}
                      draggable
                      onDragStart={(event) => handleDragStart(event, session.id)}
                      className={cn(
                        'rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5',
                        isUpdating === session.id && 'opacity-50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {session.track?.color && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: session.track.color || '#2563eb' }}
                          />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {session.track?.name || 'General'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{session.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </p>
                    </div>
                  ))}
                </div>
                {(grouped.get(room.id) || []).length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Drag sessions here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
