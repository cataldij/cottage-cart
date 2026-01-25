import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Users,
  UserCheck,
  MessageSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

async function getAnalyticsData(conferenceId?: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's conferences
  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const conferencesList = conferences as { id: string; name: string }[] | null
  const targetConferenceId = conferenceId || conferencesList?.[0]?.id

  if (!targetConferenceId) return null

  // Get real-time metrics
  const [
    { count: totalMembers },
    { count: checkedInMembers },
    { count: totalSessions },
    { data: popularSessions },
    { data: analyticsEvents },
  ] = await Promise.all([
    supabase
      .from('conference_members')
      .select('*', { count: 'exact', head: true })
      .eq('conference_id', targetConferenceId),
    supabase
      .from('conference_members')
      .select('*', { count: 'exact', head: true })
      .eq('conference_id', targetConferenceId)
      .eq('checked_in', true),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('conference_id', targetConferenceId),
    supabase
      .from('saved_sessions')
      .select(`
        session_id,
        session:sessions(title)
      `)
      .limit(10),
    supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('conference_id', targetConferenceId)
      .order('created_at', { ascending: true })
      .limit(1000),
  ])

  // Process session popularity
  const sessionCounts = popularSessions?.reduce((acc: any, item: any) => {
    const sessionId = item.session_id
    if (!acc[sessionId]) {
      acc[sessionId] = {
        id: sessionId,
        title: item.session?.title || 'Unknown',
        saves: 0,
      }
    }
    acc[sessionId].saves++
    return acc
  }, {})

  const topSessions = Object.values(sessionCounts || {})
    .sort((a: any, b: any) => b.saves - a.saves)
    .slice(0, 5)

  // Process event timeline
  const events = analyticsEvents as { event_type: string; created_at: string }[] | null
  const eventsByDay = events?.reduce((acc: any, event) => {
    const date = new Date(event.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = { date, events: 0 }
    }
    acc[date].events++
    return acc
  }, {})

  const timelineData = Object.values(eventsByDay || {}).slice(-7)

  // Event type distribution
  const eventTypes = events?.reduce((acc: any, event) => {
    if (!acc[event.event_type]) {
      acc[event.event_type] = 0
    }
    acc[event.event_type]++
    return acc
  }, {})

  const eventTypeData = Object.entries(eventTypes || {}).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    value: count,
  }))

  return {
    conferences: conferencesList || [],
    currentConference: conferencesList?.find((c) => c.id === targetConferenceId),
    totalMembers: totalMembers || 0,
    checkedInMembers: checkedInMembers || 0,
    totalSessions: totalSessions || 0,
    topSessions,
    timelineData,
    eventTypeData,
    checkInRate: totalMembers ? ((checkedInMembers || 0) / totalMembers) * 100 : 0,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-semibold">No conferences found</h3>
          <p className="text-sm text-muted-foreground">
            Create a conference to see analytics
          </p>
        </div>
      </div>
    )
  }

  const COLORS = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#0891b2']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and metrics for {data.currentConference?.name}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Registered for this conference
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.checkInRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.checkedInMembers} of {data.totalMembers} checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Scheduled sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.eventTypeData.reduce((sum, item) => sum + (item.value as number), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Daily event activity over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Events"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
            <CardDescription>Distribution of user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Sessions</CardTitle>
          <CardDescription>Sessions saved to personal schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topSessions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="saves" fill="#2563eb" name="Saves" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>Comprehensive overview of all metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{data.totalMembers}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold">{data.checkedInMembers}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Check-in Rate</p>
                <p className="text-2xl font-bold">{data.checkInRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{data.totalSessions}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Most Saved Session
                </p>
                <p className="text-lg font-semibold">
                  {data.topSessions[0]?.title || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.topSessions[0]?.saves || 0} saves
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total User Actions
                </p>
                <p className="text-2xl font-bold">
                  {data.eventTypeData.reduce(
                    (sum, item) => sum + (item.value as number),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
