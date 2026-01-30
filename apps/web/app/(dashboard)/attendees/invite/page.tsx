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
  if (!user) redirect('/login')

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return { conference: null }
  }

  return { conference: conferences[0] }
}

async function inviteAttendeeAction(formData: FormData) {
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
    redirect('/dashboard/conferences')
  }

  const conferenceId = conferences[0].id
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const role = String(formData.get('role') || 'attendee')
  const ticketType = String(formData.get('ticket_type') || 'general')
  const issueTicket = formData.get('issue_ticket') === 'on'

  if (!email) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .single()

  if (!profile) {
    throw new Error('User profile not found for this email.')
  }

  const ticketCode = issueTicket
    ? `${conferenceId.slice(0, 8)}-${profile.id.slice(0, 8)}-${Date.now().toString(36)}`
    : null

  const { error } = await supabase.from('conference_members').upsert({
    conference_id: conferenceId,
    user_id: profile.id,
    role,
    ticket_type: ticketType,
    ticket_code: ticketCode,
  })

  if (error) throw new Error(error.message)

  redirect('/dashboard/attendees')
}

export default async function InviteAttendeePage() {
  const { conference } = await getInviteData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Add Attendee</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Add Attendee</h1>
          <p className="text-muted-foreground">Invite someone to {conference.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/attendees">Back to Attendees</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendee Details</CardTitle>
          <CardDescription>
            Invite an existing user by email and set their role and ticket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={inviteAttendeeAction} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="attendee@email.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The user must already exist in the system.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                name="role"
                defaultValue="attendee"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="attendee">Attendee</option>
                <option value="speaker">Speaker</option>
                <option value="sponsor">Sponsor</option>
                <option value="staff">Staff</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ticket type</label>
              <input
                name="ticket_type"
                defaultValue="general"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
              <input type="checkbox" name="issue_ticket" defaultChecked />
              Issue ticket code
            </label>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/attendees">Cancel</Link>
              </Button>
              <Button type="submit">Add Attendee</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
