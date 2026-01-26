import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react'

async function getAnalyticsData() {
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
    return null
  }

  const conference = conferences[0]

  const [{ count: totalAttendees }, { count: checkedIn }] = await Promise.all([
    supabase
      .from('conference_members')
      .select('*', { count: 'exact', head: true })
      .eq('conference_id', conference.id),
    supabase
      .from('conference_members')
      .select('*', { count: 'exact', head: true })
      .eq('conference_id', conference.id)
      .eq('checked_in', true),
  ])

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, start_time')
    .eq('conference_id', conference.id)
    .order('start_time', { ascending: true })

  const sessionIds = sessions?.map((s) => s.id) || []

  const { count: savedCount } =
    sessionIds.length > 0
      ? await supabase
          .from('saved_sessions')
          .select('*', { count: 'exact', head: true })
          .in('session_id', sessionIds)
      : { count: 0 }

  const { data: savedSessions } =
    sessionIds.length > 0
      ? await supabase
          .from('saved_sessions')
          .select('session_id')
          .in('session_id', sessionIds)
      : { data: [] }

  const sessionMap = new Map<string, string>()
  sessions?.forEach((s) => sessionMap.set(s.id, s.title))

  const counts = new Map<string, number>()
  savedSessions?.forEach((row) => {
    counts.set(row.session_id, (counts.get(row.session_id) || 0) + 1)
  })

  const topSessions = Array.from(counts.entries())
    .map(([id, count]) => ({
      id,
      title: sessionMap.get(id) || 'Session',
      saves: count,
    }))
    .sort((a, b) => b.saves - a.saves)
    .slice(0, 5)

  const engagementRate =
    totalAttendees && totalAttendees > 0
      ? Math.round(((savedCount || 0) / totalAttendees) * 100)
      : 0

  return {
    conference,
    totalAttendees: totalAttendees || 0,
    checkedIn: checkedIn || 0,
    totalSessions: sessions?.length || 0,
    engagementRate,
    topSessions,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Create a conference to start tracking analytics.
          </p>
        </div>
      </div>
    )
  }

  const checkInRate =
    data.totalAttendees > 0
      ? Math.round((data.checkedIn / data.totalAttendees) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Conference insights for {data.conference.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAttendees}</div>
            <p className="text-xs text-muted-foreground">registered attendees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.checkedIn}</div>
            <p className="text-xs text-muted-foreground">{checkInRate}% check-in rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSessions}</div>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">sessions saved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Check-in Progress</CardTitle>
            <CardDescription>
              {data.checkedIn} of {data.totalAttendees} attendees checked in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${checkInRate}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Sessions</CardTitle>
            <CardDescription>Most saved sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No engagement yet.</p>
            ) : (
              <div className="space-y-3">
                {data.topSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <p className="text-sm font-medium">{session.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {session.saves} saves
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
