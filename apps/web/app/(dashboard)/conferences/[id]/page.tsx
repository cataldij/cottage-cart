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
import {
  Calendar,
  Users,
  MapPin,
  Eye,
  ExternalLink,
  Pencil,
  ArrowLeft,
  Settings,
} from 'lucide-react'

async function getConference(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: conference } = await supabase
    .from('conferences')
    .select('*')
    .eq('id', id)
    .single()

  if (!conference) {
    redirect('/conferences')
  }

  return { conference, userId: user.id }
}

export default async function ConferenceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // @ts-expect-error Server component async
  const { conference } = await getConference(params.id)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/conferences">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{conference.name}</h1>
          </div>
          {conference.tagline && (
            <p className="text-lg text-muted-foreground ml-11">{conference.tagline}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/c/${conference.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
          >
            <Link href={`/conferences/${conference.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Conference
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {formatDate(conference.start_date)}
            </p>
            <p className="text-xs text-muted-foreground">
              to {formatDate(conference.end_date)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venue</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {conference.venue_name || 'Not set'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {conference.venue_address || 'Add venue details'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {conference.registration_open ? (
                <span className="text-green-600">Open</span>
              ) : (
                <span className="text-red-600">Closed</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {conference.max_attendees
                ? `${conference.max_attendees} max attendees`
                : 'No limit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visibility</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {conference.is_public ? 'Public' : 'Private'}
            </p>
            <p className="text-xs text-muted-foreground">
              {conference.is_hybrid ? 'Hybrid event' : 'In-person only'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {conference.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {conference.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your conference</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/conferences/${conference.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Details & Branding
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/sessions?conference=${conference.id}`}>
                <Calendar className="mr-2 h-4 w-4" />
                Manage Sessions
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/speakers?conference=${conference.id}`}>
                <Users className="mr-2 h-4 w-4" />
                Manage Speakers
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/conferences/${conference.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendee Link */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Share with Attendees</CardTitle>
          <CardDescription className="text-blue-700">
            Your conference is available at this URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm">
              https://conference-os.vercel.app/c/{conference.slug}
            </code>
            <Button variant="outline" asChild>
              <Link href={`/c/${conference.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
