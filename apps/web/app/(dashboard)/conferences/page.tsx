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
  Calendar,
  MapPin,
  Users,
  Settings,
  ExternalLink,
  MoreHorizontal,
  Globe,
  Lock,
} from 'lucide-react'

async function getConferencesData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get conferences where user is organizer
  const { data: conferences, error } = await supabase
    .from('conferences')
    .select(`
      *,
      members:conference_members(count)
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching conferences:', error)
  }

  return {
    conferences: conferences || [],
    userId: user.id,
  }
}

export default async function ConferencesPage() {
  const { conferences, userId } = await getConferencesData()

  const now = new Date()
  const activeConferences = conferences.filter(
    (c) => new Date(c.start_date) <= now && new Date(c.end_date) >= now
  )
  const upcomingConferences = conferences.filter(
    (c) => new Date(c.start_date) > now
  )
  const pastConferences = conferences.filter(
    (c) => new Date(c.end_date) < now
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conferences</h1>
          <p className="text-muted-foreground">
            Create and manage your conference events
          </p>
        </div>
        <Button asChild>
          <Link href="/conferences/new">
            <Plus className="mr-2 h-4 w-4" />
            New Conference
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conferences</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conferences.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConferences.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingConferences.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conferences.reduce((sum, c) => sum + (c.members?.[0]?.count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conference List */}
      {conferences.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold">No conferences yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first conference to start building your event
            </p>
            <Button asChild>
              <Link href="/conferences/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Conference
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Conferences */}
          {activeConferences.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Active Now
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeConferences.map((conference) => (
                  <ConferenceCard key={conference.id} conference={conference} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Conferences */}
          {upcomingConferences.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Upcoming</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingConferences.map((conference) => (
                  <ConferenceCard key={conference.id} conference={conference} />
                ))}
              </div>
            </div>
          )}

          {/* Past Conferences */}
          {pastConferences.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-muted-foreground">Past</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastConferences.map((conference) => (
                  <ConferenceCard key={conference.id} conference={conference} isPast />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ConferenceCard({
  conference,
  isPast = false,
}: {
  conference: any
  isPast?: boolean
}) {
  const startDate = new Date(conference.start_date)
  const endDate = new Date(conference.end_date)

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  return (
    <Card className={`overflow-hidden ${isPast ? 'opacity-70' : ''}`}>
      {/* Banner */}
      <div
        className="h-24 relative"
        style={{ backgroundColor: conference.primary_color || '#2563eb' }}
      >
        {conference.banner_url && (
          <Image
            src={conference.banner_url}
            alt={conference.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {conference.is_public ? (
            <div className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Public
            </div>
          ) : (
            <div className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Private
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{conference.name}</h3>
            {conference.tagline && (
              <p className="text-sm text-muted-foreground">{conference.tagline}</p>
            )}
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDateRange(startDate, endDate)}</span>
            </div>
            {conference.venue_name && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{conference.venue_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{conference.members?.[0]?.count || 0} attendees</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {conference.registration_open ? 'Registration open' : 'Registration closed'}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/conferences/${conference.id}`}>
                  <Settings className="mr-1 h-3 w-3" />
                  Manage
                </Link>
              </Button>
              {conference.is_public && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/c/${conference.slug}`} target="_blank">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
