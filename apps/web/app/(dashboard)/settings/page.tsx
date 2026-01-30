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

async function getSettingsData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conferences } = await supabase
    .from('conferences')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return { conference: null }
  }

  return { conference: conferences[0] }
}

async function updateSettingsAction(id: string, formData: FormData) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const payload = {
    registration_open: formData.get('registration_open') === 'on',
    is_public: formData.get('is_public') === 'on',
    is_hybrid: formData.get('is_hybrid') === 'on',
    max_attendees: formData.get('max_attendees')
      ? Number(formData.get('max_attendees'))
      : null,
  }

  const { error } = await supabase.from('conferences').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export default async function SettingsPage() {
  const { conference } = await getSettingsData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Update registration and visibility settings.
        </p>
      </div>

      <form action={updateSettingsAction.bind(null, conference.id)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Registration</CardTitle>
            <CardDescription>Manage attendee registration settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="registration_open" defaultChecked={conference.registration_open} />
              Registration open
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="is_public" defaultChecked={conference.is_public} />
              Public listing
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="is_hybrid" defaultChecked={conference.is_hybrid} />
              Hybrid event
            </label>
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
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  )
}
