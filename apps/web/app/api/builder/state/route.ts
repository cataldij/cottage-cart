import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const conferenceId = url.searchParams.get('conferenceId')

  const { data: conferences, error: confError } = await supabase
    .from('conferences')
    .select('id, name, tagline, description, start_date, end_date, venue_name, venue_address, logo_url, banner_url, primary_color, secondary_color, accent_color, background_color, font_heading, font_body, nav_background_color, nav_text_color, hero_style, hero_height, hero_background_url, hero_video_url, hero_overlay_opacity, background_pattern, background_pattern_color, background_gradient_start, background_gradient_end, background_image_url, background_image_overlay')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (confError) {
    return NextResponse.json({ error: confError.message }, { status: 500 })
  }

  const selectedConference = conferenceId
    ? conferences?.find((c) => c.id === conferenceId)
    : conferences?.[0]

  if (!selectedConference) {
    return NextResponse.json({ error: 'Conference not found' }, { status: 404 })
  }

  const { data: designTokens } = await supabase
    .from('design_tokens')
    .select('tokens')
    .eq('conference_id', selectedConference.id)
    .eq('is_active', true)
    .single()

  return NextResponse.json({
    conference: selectedConference,
    designTokens: designTokens?.tokens ?? null,
  })
}
