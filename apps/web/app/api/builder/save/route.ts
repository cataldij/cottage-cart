import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const conferenceId = body?.overview?.id

  if (!conferenceId) {
    return NextResponse.json({ error: 'Missing conference id' }, { status: 400 })
  }

  const overview = body.overview || {}
  const design = body.design || {}
  const web = body.web || {}

  const { error: updateError } = await supabase
    .from('conferences')
    .update({
      name: overview.name || null,
      tagline: overview.tagline || null,
      description: overview.description || null,
      start_date: overview.startDate || null,
      end_date: overview.endDate || null,
      venue_name: overview.venueName || null,
      venue_address: overview.venueAddress || null,
      logo_url: overview.logoUrl || null,
      banner_url: overview.bannerUrl || null,
      primary_color: design?.tokens?.colors?.primary || null,
      secondary_color: design?.tokens?.colors?.secondary || null,
      accent_color: design?.tokens?.colors?.accent || null,
      background_color: design?.tokens?.colors?.background || null,
      font_heading: design?.tokens?.typography?.fontFamily?.heading || null,
      font_body: design?.tokens?.typography?.fontFamily?.body || null,
      nav_background_color: web.navBackgroundColor || null,
      nav_text_color: web.navTextColor || null,
      hero_style: web.heroStyle || null,
      hero_height: web.heroHeight || null,
      hero_background_url: web.heroBackgroundUrl || null,
      hero_video_url: web.heroVideoUrl || null,
      hero_overlay_opacity: web.heroOverlayOpacity ?? null,
      background_pattern: web.backgroundPattern || null,
      background_pattern_color: web.backgroundPatternColor || null,
      background_gradient_start: web.backgroundGradientStart || null,
      background_gradient_end: web.backgroundGradientEnd || null,
      background_image_url: web.backgroundImageUrl || null,
      background_image_overlay: web.backgroundImageOverlay ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conferenceId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const tokens = {
    ...(design.tokens || {}),
    app: {
      ...(design.tokens?.app || {}),
      iconTheme: design.iconTheme || 'solid',
      backgroundPattern: body?.app?.backgroundPattern || null,
      backgroundPatternColor: body?.app?.backgroundPatternColor || null,
      backgroundGradientStart: body?.app?.backgroundGradientStart || null,
      backgroundGradientEnd: body?.app?.backgroundGradientEnd || null,
      backgroundImageUrl: body?.app?.backgroundImageUrl || null,
      backgroundImageOverlay: body?.app?.backgroundImageOverlay ?? null,
    },
  }

  const { data: existingToken } = await supabase
    .from('design_tokens')
    .select('id')
    .eq('conference_id', conferenceId)
    .eq('is_active', true)
    .maybeSingle()

  if (existingToken?.id) {
    await supabase
      .from('design_tokens')
      .update({ tokens, updated_at: new Date().toISOString() })
      .eq('id', existingToken.id)
  } else {
    await supabase
      .from('design_tokens')
      .insert({
        conference_id: conferenceId,
        tokens,
        is_active: true,
        created_by: user.id,
      })
  }

  return NextResponse.json({ ok: true })
}
