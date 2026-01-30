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

async function getInviteData() {
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

  if (!conferences || conferences.length === 0) {
    return { conference: null }
  }

  return { conference: conferences[0] }
}

async function inviteSpeakerAction(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    redirect('/conferences')
  }

  const conferenceId = conferences[0].id
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const company = String(formData.get('company') || '').trim() || null
  const title = String(formData.get('title') || '').trim() || null
  const bio = String(formData.get('bio') || '').trim() || null

  if (!email) {
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', email)
    .single()

  if (!profile) {
    throw new Error('Speaker profile not found for this email.')
  }

  await supabase
    .from('conference_members')
    .upsert({
      conference_id: conferenceId,
      user_id: profile.id,
      role: 'speaker',
    })

  await supabase
    .from('speaker_profiles')
    .upsert({
      conference_id: conferenceId,
      user_id: profile.id,
      company,
      title,
      bio,
    })

  redirect('/speakers')
}

export default async function InviteSpeakerPage() {
  const { conference } = await getInviteData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Invite Speaker</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invite Speaker</h1>
          <p className="text-muted-foreground">
            Add a speaker to {conference.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/speakers">Back to Speakers</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Speaker Details</CardTitle>
          <CardDescription>
            Invite an existing user by email to add them as a speaker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={inviteSpeakerAction} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="speaker@email.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The user must already exist in the system.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <input
                name="company"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                name="title"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                name="bio"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/speakers">Cancel</Link>
              </Button>
              <Button type="submit">Invite Speaker</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
