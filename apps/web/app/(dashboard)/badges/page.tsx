// @ts-nocheck
// TODO: Fix Supabase type inference issues
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
import { BadgePrintControls } from '@/components/dashboard/badge-print-controls'
import { Users, CheckCircle, Filter, Search } from 'lucide-react'

async function getBadgeData(filters: {
  query?: string
  role?: string
  status?: string
}) {
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
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return { conference: null, members: [], filtered: [] }
  }

  const conferenceId = conferences[0].id

  const { data: members } = await supabase
    .from('conference_members')
    .select(
      `id, role, ticket_type, ticket_code, checked_in,
      user:profiles(full_name, email, company, job_title)`
    )
    .eq('conference_id', conferenceId)
    .order('registered_at', { ascending: false })

  const allMembers = members || []
  const query = filters.query?.trim().toLowerCase()

  const filteredMembers = allMembers.filter((member) => {
    if (filters.role && filters.role !== 'all' && member.role !== filters.role) {
      return false
    }

    if (filters.status === 'checked-in' && !member.checked_in) {
      return false
    }

    if (filters.status === 'not-checked-in' && member.checked_in) {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = [
      member.user?.full_name,
      member.user?.email,
      member.user?.company,
      member.user?.job_title,
      member.ticket_type,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })

  return {
    conference: conferences[0],
    members: allMembers,
    filtered: filteredMembers,
  }
}

export default async function BadgesPage({
  searchParams,
}: {
  searchParams?: { q?: string; role?: string; status?: string }
}) {
  const { conference, members, filtered } = await getBadgeData({
    query: searchParams?.q,
    role: searchParams?.role,
    status: searchParams?.status,
  })

  if (!conference) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Badge Printing</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  const checkedIn = members.filter((m) => m.checked_in).length
  const roleCount = new Set(members.map((m) => m.role)).size

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Badge Printing</h1>
          <p className="text-muted-foreground">
            Print attendee badges for {conference.name}
          </p>
        </div>
        <BadgePrintControls />
      </div>

      <div className="grid gap-4 md:grid-cols-3 print:hidden">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCount}</div>
          </CardContent>
        </Card>
      </div>

      <form className="flex flex-wrap items-center gap-3 print:hidden" method="get">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams?.q || ''}
            placeholder="Search badges..."
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            name="role"
            defaultValue={searchParams?.role || 'all'}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All roles</option>
            <option value="attendee">Attendee</option>
            <option value="speaker">Speaker</option>
            <option value="sponsor">Sponsor</option>
            <option value="staff">Staff</option>
            <option value="organizer">Organizer</option>
          </select>
          <select
            name="status"
            defaultValue={searchParams?.status || 'all'}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="checked-in">Checked in</option>
            <option value="not-checked-in">Not checked in</option>
          </select>
        </div>
        <Button type="submit" variant="outline" size="sm">
          Apply
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/badges">Clear</Link>
        </Button>
      </form>

      {filtered.length === 0 ? (
        <Card className="print:hidden">
          <CardContent className="flex min-h-[240px] flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold">No badges to print</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 print:grid-cols-2">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border bg-white p-6 shadow-soft print:shadow-none"
              style={{ breakInside: 'avoid' }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {conference.name}
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-[0.6rem] uppercase text-white">
                  {member.role}
                </div>
              </div>
              <div className="mt-6">
                <div className="text-2xl font-semibold">
                  {member.user?.full_name || 'Attendee'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {member.user?.job_title || 'Participant'}
                  {member.user?.company ? ` · ${member.user.company}` : ''}
                </div>
              </div>
              <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
                <div>Email: {member.user?.email || 'N/A'}</div>
                <div>Ticket: {member.ticket_type || 'General'}</div>
                <div>Code: {member.ticket_code || 'Assigned at check-in'}</div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <span>{member.checked_in ? 'Checked in' : 'Not checked in'}</span>
                <span>Conference OS</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

