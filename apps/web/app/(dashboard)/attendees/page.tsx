// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Users,
  UserCheck,
  Ticket,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react'

async function getAttendeesData() {
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
    return { attendees: [], conference: null, stats: null }
  }

  const conferenceId = conferences[0].id

  // Get attendees
  const { data: members } = await supabase
    .from('conference_members')
    .select(`
      *,
      user:profiles(
        id,
        full_name,
        email,
        avatar_url,
        company,
        job_title
      )
    `)
    .eq('conference_id', conferenceId)
    .order('registered_at', { ascending: false })

  // Calculate stats
  const totalAttendees = members?.length || 0
  const checkedIn = members?.filter((m) => m.checked_in).length || 0
  const ticketed = members?.filter((m) => m.ticket_code).length || 0

  const roleDistribution = members?.reduce((acc: any, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1
    return acc
  }, {})

  return {
    attendees: members || [],
    conference: conferences[0],
    stats: {
      total: totalAttendees,
      checkedIn,
      ticketed,
      checkInRate: totalAttendees > 0 ? ((checkedIn / totalAttendees) * 100).toFixed(1) : 0,
      roleDistribution,
    },
  }
}

export default async function AttendeesPage() {
  const { attendees, conference, stats } = await getAttendeesData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
            <p className="text-muted-foreground">
              Manage attendees for your conference
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold">No conferences yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create a conference to see attendees
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
          <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
          <p className="text-muted-foreground">
            Manage attendees for {conference.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/dashboard/attendees/invite">
              <Plus className="mr-2 h-4 w-4" />
              Add Attendee
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.checkInRate}% check-in rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticketed</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ticketed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speakers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.roleDistribution?.speaker || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search attendees..."
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Attendees</CardTitle>
          <CardDescription>
            {attendees.length} attendee{attendees.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-semibold">No attendees yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Attendees will appear here when they register
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Attendee
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Ticket
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Registered
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                            {attendee.user?.avatar_url ? (
                              <Image
                                src={attendee.user.avatar_url}
                                alt={attendee.user.full_name || 'Attendee'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                {attendee.user?.full_name?.charAt(0) || 'A'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{attendee.user?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">
                              {attendee.user?.email}
                            </p>
                            {attendee.user?.company && (
                              <p className="text-xs text-muted-foreground">
                                {attendee.user.job_title} at {attendee.user.company}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            attendee.role === 'organizer'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : attendee.role === 'speaker'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : attendee.role === 'sponsor'
                              ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : attendee.role === 'staff'
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}
                        >
                          {attendee.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {attendee.ticket_type ? (
                          <span className="text-sm">{attendee.ticket_type}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {attendee.checked_in ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Checked in</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Not checked in</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {new Date(attendee.registered_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!attendee.checked_in && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Check In
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-in Progress Bar */}
      {stats && stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Check-in Progress</CardTitle>
            <CardDescription>
              {stats.checkedIn} of {stats.total} attendees checked in ({stats.checkInRate}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${stats.checkInRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
