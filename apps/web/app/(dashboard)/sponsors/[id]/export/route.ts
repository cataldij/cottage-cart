import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const escapeCsv = (value: string | number | null | undefined) => {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return new NextResponse('Conference not found', { status: 404 })
  }

  const { data: sponsor } = await supabase
    .from('sponsors')
    .select('id, name')
    .eq('id', params.id)
    .eq('conference_id', conferences[0].id)
    .single()

  if (!sponsor) {
    return new NextResponse('Sponsor not found', { status: 404 })
  }

  const { data: leads } = await supabase
    .from('sponsor_leads')
    .select(
      `created_at, rating, notes,
      attendee:profiles!sponsor_leads_attendee_id_fkey(full_name, email, company, job_title),
      scanned_by:profiles!sponsor_leads_scanned_by_fkey(full_name, email)`
    )
    .eq('sponsor_id', sponsor.id)
    .order('created_at', { ascending: false })

  const header = [
    'Attendee',
    'Email',
    'Company',
    'Title',
    'Scanned By',
    'Rating',
    'Notes',
    'Captured At',
  ]

  const rows = (leads || []).map((lead) => [
    lead.attendee?.full_name || lead.attendee?.email || '',
    lead.attendee?.email || '',
    lead.attendee?.company || '',
    lead.attendee?.job_title || '',
    lead.scanned_by?.full_name || lead.scanned_by?.email || '',
    lead.rating ?? '',
    lead.notes || '',
    lead.created_at ? new Date(lead.created_at).toISOString() : '',
  ])

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\r\n')

  const fileName = `${sponsor.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName || 'sponsor'}-leads.csv"`,
    },
  })
}
