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

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function createConferenceAction(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = String(formData.get('name') || '').trim()
  const slugInput = String(formData.get('slug') || '').trim()
  const startDate = String(formData.get('start_date') || '').trim()
  const endDate = String(formData.get('end_date') || '').trim()

  if (!name || !startDate || !endDate) {
    return
  }

  const slug = slugInput ? slugify(slugInput) : slugify(name)

  const payload = {
    name,
    slug,
    tagline: String(formData.get('tagline') || '').trim() || null,
    description: String(formData.get('description') || '').trim() || null,
    start_date: startDate,
    end_date: endDate,
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
    created_by: user.id,
  }

  console.log('Creating conference with payload:', JSON.stringify(payload, null, 2))

  const { data, error } = await supabase
    .from('conferences')
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    console.error('Conference insert error:', error)
    throw new Error(`Failed to create conference: ${error.message} (code: ${error.code})`)
  }

  console.log('Conference created with ID:', data.id)

  // Add the creator as an organizer in conference_members
  const { error: memberError } = await supabase
    .from('conference_members')
    .insert({
      conference_id: data.id,
      user_id: user.id,
      role: 'organizer',
    })

  if (memberError) {
    console.error('Member insert error:', memberError)
    // If adding member fails, try to clean up the conference
    await supabase.from('conferences').delete().eq('id', data.id)
    throw new Error(`Failed to add organizer: ${memberError.message} (code: ${memberError.code})`)
  }

  console.log('User added as organizer, redirecting to conference page')
  redirect(`/conferences/${data.id}`)
}

export default function NewConferencePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Conference</h1>
          <p className="text-muted-foreground">
            Create a new conference and configure the essentials
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/conferences">Back to Conferences</Link>
        </Button>
      </div>

      <form action={createConferenceAction} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Conference Details</CardTitle>
            <CardDescription>
              Basic information attendees will see in the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Conference name</label>
              <input
                name="name"
                required
                placeholder="e.g., Future of Work Summit"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                name="slug"
                placeholder="auto-generated if left blank"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <input
                name="tagline"
                placeholder="Short one-line summary"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe the conference focus and audience"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates & Location</CardTitle>
            <CardDescription>
              Keep dates and venue information up to date for attendees.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start date</label>
              <input
                name="start_date"
                type="date"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End date</label>
              <input
                name="end_date"
                type="date"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <input
                name="timezone"
                defaultValue="UTC"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue name</label>
              <input
                name="venue_name"
                placeholder="Venue or city"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Venue address</label>
              <input
                name="venue_address"
                placeholder="Street address"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding & Settings</CardTitle>
            <CardDescription>
              Customize the public-facing experience and registration behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary color</label>
              <input
                name="primary_color"
                type="color"
                defaultValue="#2563eb"
                className="h-10 w-full rounded-md border border-input bg-background px-2 py-1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary color</label>
              <input
                name="secondary_color"
                type="color"
                defaultValue="#8b5cf6"
                className="h-10 w-full rounded-md border border-input bg-background px-2 py-1"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Website URL</label>
              <input
                name="website_url"
                placeholder="https://"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_public" defaultChecked />
                Public listing
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_hybrid" />
                Hybrid event
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="registration_open" defaultChecked />
                Registration open
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max attendees</label>
              <input
                name="max_attendees"
                type="number"
                min="0"
                placeholder="Optional capacity"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/conferences">Cancel</Link>
          </Button>
          <Button type="submit">Create Conference</Button>
        </div>
      </form>
    </div>
  )
}
