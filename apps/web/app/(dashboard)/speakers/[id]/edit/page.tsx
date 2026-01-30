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
import { Trash2 } from 'lucide-react'

async function getSpeakerData(speakerId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    redirect('/conferences')
  }

  const conferenceId = conferences[0].id

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', speakerId)
    .single()

  if (!profile) {
    redirect('/speakers')
  }

  const { data: speakerProfile } = await supabase
    .from('speaker_profiles')
    .select('*')
    .eq('conference_id', conferenceId)
    .eq('user_id', speakerId)
    .single()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, start_time')
    .eq('conference_id', conferenceId)
    .order('start_time', { ascending: true })

  const { data: speakerSessions } = await supabase
    .from('session_speakers')
    .select('session_id')
    .eq('speaker_id', speakerId)

  const selectedSessions = new Set(
    speakerSessions?.map((s) => s.session_id) || []
  )

  return {
    conference: conferences[0],
    profile,
    speakerProfile,
    sessions: sessions || [],
    selectedSessions,
  }
}

async function updateSpeakerAction(speakerId: string, formData: FormData) {
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
  const topics = String(formData.get('topics') || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const payload = {
    conference_id: conferenceId,
    user_id: speakerId,
    company: String(formData.get('company') || '').trim() || null,
    title: String(formData.get('title') || '').trim() || null,
    bio: String(formData.get('bio') || '').trim() || null,
    topics: topics.length ? topics : null,
    is_featured: formData.get('is_featured') === 'on',
  }

  await supabase.from('speaker_profiles').upsert(payload)
  await supabase
    .from('conference_members')
    .upsert({ conference_id: conferenceId, user_id: speakerId, role: 'speaker' })

  const selected = formData.getAll('session_ids').map(String)
  await supabase.from('session_speakers').delete().eq('speaker_id', speakerId)
  if (selected.length) {
    await supabase
      .from('session_speakers')
      .insert(selected.map((sessionId) => ({ session_id: sessionId, speaker_id: speakerId })))
  }

  redirect('/speakers')
}

async function removeSpeakerAction(speakerId: string) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('speaker_profiles').delete().eq('user_id', speakerId)
  await supabase.from('conference_members').delete().eq('user_id', speakerId)
  redirect('/speakers')
}

export default async function EditSpeakerPage({
  params,
}: {
  params: { id: string }
}) {
  const { conference, profile, speakerProfile, sessions, selectedSessions } =
    await getSpeakerData(params.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Speaker</h1>
          <p className="text-muted-foreground">{conference.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/speakers">Back</Link>
          </Button>
          <form action={removeSpeakerAction.bind(null, profile.id)}>
            <Button variant="destructive" type="submit">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </form>
        </div>
      </div>

      <form action={updateSpeakerAction.bind(null, profile.id)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Speaker Details</CardTitle>
            <CardDescription>Update profile information for the speaker.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                value={profile.full_name || ''}
                readOnly
                className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                value={profile.email}
                readOnly
                className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <input
                name="company"
                defaultValue={speakerProfile?.company || profile.company || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                name="title"
                defaultValue={speakerProfile?.title || profile.job_title || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={speakerProfile?.bio || profile.bio || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Topics (comma separated)</label>
              <input
                name="topics"
                defaultValue={speakerProfile?.topics?.join(', ') || ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={speakerProfile?.is_featured || false}
              />
              Featured speaker
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Assignment</CardTitle>
            <CardDescription>Select sessions this speaker appears in.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            ) : (
              sessions.map((session) => (
                <label key={session.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="session_ids"
                    value={session.id}
                    defaultChecked={selectedSessions.has(session.id)}
                  />
                  {session.title}
                </label>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/speakers">Cancel</Link>
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  )
}
