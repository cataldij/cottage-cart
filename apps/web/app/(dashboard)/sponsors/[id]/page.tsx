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
import { Building2, Users, Star } from 'lucide-react'

async function getSponsorDetail(id: string) {
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
    return { conference: null, sponsor: null, leads: [] }
  }

  const { data: sponsor } = await supabase
    .from('sponsors')
    .select('*')
    .eq('id', id)
    .eq('conference_id', conferences[0].id)
    .single()

  if (!sponsor) {
    return { conference: conferences[0], sponsor: null, leads: [] }
  }

  const { data: leads } = await supabase
    .from('sponsor_leads')
    .select(
      `id, created_at, notes, rating,
      attendee:profiles!sponsor_leads_attendee_id_fkey(full_name, email, company, job_title),
      scanned_by:profiles!sponsor_leads_scanned_by_fkey(full_name, email)`
    )
    .eq('sponsor_id', sponsor.id)
    .order('created_at', { ascending: false })

  return { conference: conferences[0], sponsor, leads: leads || [] }
}

export default async function SponsorDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { conference, sponsor, leads } = await getSponsorDetail(params.id)

  if (!conference) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sponsor Detail</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/dashboard/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  if (!sponsor) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sponsor not found</h1>
        <p className="text-muted-foreground">
          This sponsor is not associated with {conference.name}.
        </p>
        <Button asChild>
          <Link href="/dashboard/sponsors">Back to Sponsors</Link>
        </Button>
      </div>
    )
  }

  const ratings = leads.filter((lead) => typeof lead.rating === 'number')
  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, lead) => sum + lead.rating, 0) / ratings.length) * 10) /
        10
      : 0

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{sponsor.name}</h1>
          <p className="text-muted-foreground">
            {sponsor.tier} sponsor for {conference.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/sponsors">Back to Sponsors</Link>
          </Button>
          <Button asChild>
            <a href={`/dashboard/sponsors/${sponsor.id}/export`}>Export CSV</a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booth</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sponsor.booth_number || 'TBD'}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Details</CardTitle>
          <CardDescription>
            {leads.length} lead{leads.length !== 1 ? 's' : ''} captured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {lead.attendee?.full_name || lead.attendee?.email || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.attendee?.job_title || 'Attendee'}
                        {lead.attendee?.company ? ` at ${lead.attendee.company}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.attendee?.email || 'No email captured'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>
                        {new Date(lead.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      <p>Rating: {lead.rating || 'N/A'}</p>
                      <p>
                        Captured by {lead.scanned_by?.full_name || lead.scanned_by?.email || 'Staff'}
                      </p>
                    </div>
                  </div>
                  {lead.notes && (
                    <p className="mt-3 text-sm text-muted-foreground">{lead.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
