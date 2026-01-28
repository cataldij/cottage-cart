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
import { Calendar, Users, MapPin, Trash2, Palette, Eye, ExternalLink } from 'lucide-react'

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
    redirect('/dashboard/conferences')
  }

  return { conference, userId: user.id }
}

async function updateConferenceAction(id: string, formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const payload = {
    name: String(formData.get('name') || '').trim(),
    tagline: String(formData.get('tagline') || '').trim() || null,
    description: String(formData.get('description') || '').trim() || null,
    start_date: String(formData.get('start_date') || '').trim(),
    end_date: String(formData.get('end_date') || '').trim(),
    timezone: String(formData.get('timezone') || 'UTC'),
    venue_name: String(formData.get('venue_name') || '').trim() || null,
    venue_address: String(formData.get('venue_address') || '').trim() || null,
    primary_color: String(formData.get('primary_color') || '#2563eb'),
    secondary_color: String(formData.get('secondary_color') || '').trim() || null,
    website_url: String(formData.get('website_url') || '').trim() || null,
    is_public: formData.get('is_public') === 'on',
    is_hybrid: formData.get('is_hybrid') === 'on',
    registration_open: formData.get('registration_open') === 'on',
    max_attendees: formData.get('max_attendees')
      ? Number(formData.get('max_attendees'))
      : null,
  }

  const { error } = await supabase
    .from('conferences')
    .update(payload)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

async function deleteConferenceAction(id: string) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('conferences').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  redirect('/dashboard/conferences')
}

export default async function ConferenceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { conference } = await getConference(params.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{conference.name}</h1>
          <p className="text-muted-foreground">Conference settings and overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/c/${conference.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/conferences/${conference.id}/settings`}>
              <Palette className="mr-2 h-4 w-4" />
              Customize
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/conferences">Back</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {conference.start_date} - {conference.end_date}
            </p>
            <p className="text-xs text-muted-foreground">{conference.timezone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venue</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm">{conference.venue_name || 'TBD'}</p>
            <p className="text-xs text-muted-foreground">
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
            <p className="text-sm">
              {conference.registration_open ? 'Open' : 'Closed'}
            </p>
            <p className="text-xs text-muted-foreground">
              {conference.max_attendees ? `${conference.max_attendees} cap` : 'No cap set'}
            </p>
          </CardContent>
        </Card>
      </div>

      <form action={updateConferenceAction.bind(null, conference.id)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit conference</CardTitle>
            <CardDescription>Update the core details for your event.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Conference name</label>
              <input
                name="name"
                defaultValue={conference.name}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <input
                name="tagline"
                defaultValue={conference.tagline || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={conference.description || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates & location</CardTitle>
            <CardDescription>Adjust schedule and venue information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start date</label>
              <input
                name="start_date"
                type="date"
                defaultValue={conference.start_date?.split('T')[0]}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End date</label>
              <input
                name="end_date"
                type="date"
                defaultValue={conference.end_date?.split('T')[0]}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <input
                name="timezone"
                defaultValue={conference.timezone || 'UTC'}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue name</label>
              <input
                name="venue_name"
                defaultValue={conference.venue_name || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Venue address</label>
              <input
                name="venue_address"
                defaultValue={conference.venue_address || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding & settings</CardTitle>
            <CardDescription>Update public options and registration.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary color</label>
              <input
                name="primary_color"
                type="color"
                defaultValue={conference.primary_color || '#2563eb'}
                className="h-10 w-full rounded-md border border-input bg-background px-2 py-1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary color</label>
              <input
                name="secondary_color"
                type="color"
                defaultValue={conference.secondary_color || '#8b5cf6'}
                className="h-10 w-full rounded-md border border-input bg-background px-2 py-1"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Website URL</label>
              <input
                name="website_url"
                defaultValue={conference.website_url || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_public" defaultChecked={conference.is_public} />
                Public listing
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_hybrid" defaultChecked={conference.is_hybrid} />
                Hybrid event
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="registration_open"
                  defaultChecked={conference.registration_open}
                />
                Registration open
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max attendees</label>
              <input
                name="max_attendees"
                type="number"
                min="0"
                defaultValue={conference.max_attendees || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/conferences">Cancel</Link>
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  )
}
