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
import { Building2, Plus, Trash2, ArrowUpRight } from 'lucide-react'

async function getSponsorsData() {
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
    return { conference: null, sponsors: [] }
  }

  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('*, leads:sponsor_leads(count)')
    .eq('conference_id', conferences[0].id)
    .order('created_at', { ascending: false })

  return { conference: conferences[0], sponsors: sponsors || [] }
}

async function createSponsorAction(formData: FormData) {
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

  const payload = {
    conference_id: conferences[0].id,
    name: String(formData.get('name') || '').trim(),
    tier: String(formData.get('tier') || 'exhibitor'),
    description: String(formData.get('description') || '').trim() || null,
    website_url: String(formData.get('website_url') || '').trim() || null,
    booth_number: String(formData.get('booth_number') || '').trim() || null,
    lead_capture_enabled: formData.get('lead_capture_enabled') === 'on',
  }

  const { error } = await supabase.from('sponsors').insert(payload)
  if (error) throw new Error(error.message)

  redirect('/dashboard/sponsors')
}

async function deleteSponsorAction(id: string) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('sponsors').delete().eq('id', id)
  if (error) throw new Error(error.message)

  redirect('/dashboard/sponsors')
}

export default async function SponsorsPage() {
  const { conference, sponsors } = await getSponsorsData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Sponsors</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  const totalLeads = sponsors.reduce(
    (sum, sponsor) => sum + (sponsor.leads?.[0]?.count || 0),
    0
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-muted-foreground">Manage sponsors for {conference.name}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sponsors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sponsors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Captured</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Capture</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sponsors.length > 0
                ? Math.round(
                    (sponsors.filter((s) => s.lead_capture_enabled).length / sponsors.length) *
                      100
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Sponsor</CardTitle>
          <CardDescription>Register a sponsor or exhibitor.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSponsorAction} className="grid gap-4 md:grid-cols-3">
            <input
              name="name"
              placeholder="Sponsor name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
              required
            />
            <select
              name="tier"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="exhibitor">Exhibitor</option>
            </select>
            <input
              name="booth_number"
              placeholder="Booth number"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              name="website_url"
              placeholder="Website URL"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
            />
            <textarea
              name="description"
              rows={2}
              placeholder="Description"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-3"
            />
            <label className="flex items-center gap-2 text-sm font-medium md:col-span-3">
              <input type="checkbox" name="lead_capture_enabled" defaultChecked />
              Lead capture enabled
            </label>
            <div className="md:col-span-3">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Sponsor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Sponsors</CardTitle>
          <CardDescription>{sponsors.length} sponsors</CardDescription>
        </CardHeader>
        <CardContent>
          {sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sponsors yet.</p>
          ) : (
            <div className="space-y-3">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <Link
                      href={`/dashboard/sponsors/${sponsor.id}`}
                      className="font-medium hover:underline"
                    >
                      {sponsor.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {sponsor.tier} - Booth {sponsor.booth_number || 'TBD'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sponsor.leads?.[0]?.count || 0} leads
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/sponsors/${sponsor.id}`}>
                        View leads
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={deleteSponsorAction.bind(null, sponsor.id)}>
                      <Button variant="ghost" size="icon" type="submit">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
