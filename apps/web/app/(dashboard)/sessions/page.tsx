// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react'

async function getSessionsData() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's conferences
  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (!conferences || conferences.length === 0) {
    return { sessions: [], conference: null }
  }

  const conferenceId = conferences[0].id

  // Get sessions with tracks, rooms, and speaker count
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      track:tracks(name, color),
      room:rooms(name),
      session_speakers(count)
    `)
    .eq('conference_id', conferenceId)
    .order('start_time', { ascending: true })

  return {
    sessions: sessions || [],
    conference: conferences[0],
  }
}

export default async function SessionsPage() {
  const { sessions, conference } = await getSessionsData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
            <p className="text-muted-foreground">
              Manage your conference sessions and schedule
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold">No conferences yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create a conference to start adding sessions
            </p>
            <Button asChild>
              <Link href="/dashboard/conferences">
                <Plus className="mr-2 h-4 w-4" />
                Create Conference
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">
            Manage sessions for {conference.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sessions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keynotes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter((s) => s.session_type === 'keynote').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workshops</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter((s) => s.session_type === 'workshop').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0
                ? Math.round(
                    sessions.reduce((sum, s) => {
                      const duration =
                        (new Date(s.end_time).getTime() -
                          new Date(s.start_time).getTime()) /
                        1000 /
                        60
                      return sum + duration
                    }, 0) / sessions.length
                  )
                : 0}
              m
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-semibold">No sessions yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Start building your conference agenda
              </p>
              <Button asChild>
                <Link href="/dashboard/sessions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Session
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const startTime = new Date(session.start_time)
                const endTime = new Date(session.end_time)
                const duration = Math.round(
                  (endTime.getTime() - startTime.getTime()) / 1000 / 60
                )

                return (
                  <div
                    key={session.id}
                    className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        {session.track && (
                          <div
                            className="mt-1 h-2 w-2 rounded-full"
                            style={{ backgroundColor: session.track.color || '#2563eb' }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{session.title}</h3>
                          {session.track && (
                            <p className="text-sm text-muted-foreground">
                              {session.track.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {startTime.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {startTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}{' '}
                            - {endTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}{' '}
                            ({duration}m)
                          </span>
                        </div>

                        {session.room && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.room.name}</span>
                          </div>
                        )}

                        {session.session_speakers?.[0]?.count > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {session.session_speakers[0].count} speaker
                              {session.session_speakers[0].count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {session.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {session.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            session.session_type === 'keynote'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : session.session_type === 'workshop'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : session.session_type === 'panel'
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}
                        >
                          {session.session_type}
                        </span>
                        {session.is_featured && (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Featured
                          </span>
                        )}
                        {session.requires_registration && (
                          <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            Registration Required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/sessions/${session.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
