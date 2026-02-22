import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface BuilderPayload {
  overview?: {
    id?: string
    name?: string
    tagline?: string
    description?: string
    venueName?: string
    venueAddress?: string
    logoUrl?: string | null
    bannerUrl?: string | null
  }
  design?: {
    tokens?: any
    cardStyle?: any
    iconTheme?: string
    gradients?: any
  }
  sections?: any[]
  web?: {
    navBackgroundColor?: string | null
    navTextColor?: string | null
    heroStyle?: string | null
    heroHeight?: string | null
    heroBackgroundUrl?: string | null
    heroVideoUrl?: string | null
    heroOverlayOpacity?: number | null
    backgroundPattern?: string | null
    backgroundPatternColor?: string | null
    backgroundGradientStart?: string | null
    backgroundGradientEnd?: string | null
    backgroundImageUrl?: string | null
    backgroundImageOverlay?: number | null
  }
  app?: {
    backgroundPattern?: string | null
    backgroundPatternColor?: string | null
    backgroundGradientStart?: string | null
    backgroundGradientEnd?: string | null
    backgroundImageUrl?: string | null
    backgroundImageOverlay?: number | null
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}

async function buildUniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, preferred: string, currentShopId?: string) {
  const base = slugify(preferred) || 'my-shop'

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    const { data: existing } = await supabase
      .from('shops')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    if (!existing || (currentShopId && existing.id === currentShopId)) {
      return candidate
    }
  }

  return `${base}-${Date.now().toString().slice(-6)}`
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as BuilderPayload
  const overview = body.overview || {}
  const design = body.design || {}
  const web = body.web || {}
  const app = body.app || {}

  const desiredName = overview.name?.trim() || "My Maker's Market Shop"
  let shopId = overview.id

  let shopRecord: { id: string; slug: string } | null = null

  if (shopId) {
    const { data: existing } = await supabase
      .from('shops')
      .select('id, slug')
      .eq('id', shopId)
      .eq('created_by', user.id)
      .maybeSingle()
    if (existing) {
      shopRecord = existing
    }
  }

  if (!shopRecord) {
    const { data: latestShop } = await supabase
      .from('shops')
      .select('id, slug')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestShop) {
      shopRecord = latestShop
      shopId = latestShop.id
    }
  }

  if (!shopRecord) {
    const slug = await buildUniqueSlug(supabase, desiredName)
    const { data: insertedShop, error: insertError } = await supabase
      .from('shops')
      .insert({
        created_by: user.id,
        slug,
        name: desiredName,
        category: 'bakery',
      })
      .select('id, slug')
      .single()

    if (insertError || !insertedShop) {
      return NextResponse.json({ error: insertError?.message || 'Could not create shop' }, { status: 500 })
    }

    shopRecord = insertedShop
    shopId = insertedShop.id
  }

  const resolvedSlug = shopRecord?.slug || await buildUniqueSlug(supabase, desiredName, shopId)

  const updatePayload = {
    slug: resolvedSlug,
    name: desiredName,
    tagline: overview.tagline?.trim() || null,
    description: overview.description?.trim() || null,
    location_name: overview.venueName?.trim() || null,
    location_address: overview.venueAddress?.trim() || null,
    logo_url: overview.logoUrl || null,
    banner_url: overview.bannerUrl || null,
    primary_color: design?.tokens?.colors?.primary || null,
    secondary_color: design?.tokens?.colors?.secondary || null,
    accent_color: design?.tokens?.colors?.accent || null,
    background_color: design?.tokens?.colors?.background || null,
    text_color: design?.tokens?.colors?.text || null,
    heading_color: design?.tokens?.colors?.heading || null,
    font_heading: design?.tokens?.typography?.fontFamily?.heading || null,
    font_body: design?.tokens?.typography?.fontFamily?.body || null,
    nav_background_color: web.navBackgroundColor || null,
    nav_text_color: web.navTextColor || null,
    hero_style: web.heroStyle || null,
    hero_height: web.heroHeight || null,
    hero_background_url: web.heroBackgroundUrl || null,
    hero_video_url: web.heroVideoUrl || null,
    hero_overlay_opacity: web.heroOverlayOpacity != null ? String(web.heroOverlayOpacity) : null,
    background_pattern: web.backgroundPattern || null,
    background_pattern_color: web.backgroundPatternColor || null,
    background_gradient_start: web.backgroundGradientStart || null,
    background_gradient_end: web.backgroundGradientEnd || null,
    background_image_url: web.backgroundImageUrl || null,
    background_image_overlay: web.backgroundImageOverlay != null ? String(web.backgroundImageOverlay) : null,
    app_background_pattern: app.backgroundPattern || null,
    app_background_pattern_color: app.backgroundPatternColor || null,
    app_background_gradient_start: app.backgroundGradientStart || null,
    app_background_gradient_end: app.backgroundGradientEnd || null,
    app_background_image_url: app.backgroundImageUrl || null,
    app_background_image_overlay: app.backgroundImageOverlay != null ? String(app.backgroundImageOverlay) : null,
    app_icon_theme: design.iconTheme || null,
    updated_at: new Date().toISOString(),
  }

  const { data: updatedShop, error: updateError } = await supabase
    .from('shops')
    .update(updatePayload)
    .eq('id', shopId)
    .eq('created_by', user.id)
    .select('id, slug, name')
    .single()

  if (updateError || !updatedShop) {
    return NextResponse.json({ error: updateError?.message || 'Could not save shop settings' }, { status: 500 })
  }

  const sections = body.sections || []

  const tokens = {
    ...(design.tokens || {}),
    sections,
    gradients: design.gradients || null,
    app: {
      ...(design.tokens?.app || {}),
      cardStyle: design.cardStyle || null,
      iconTheme: design.iconTheme || 'solid',
      backgroundPattern: app.backgroundPattern || null,
      backgroundPatternColor: app.backgroundPatternColor || null,
      backgroundGradientStart: app.backgroundGradientStart || null,
      backgroundGradientEnd: app.backgroundGradientEnd || null,
      backgroundImageUrl: app.backgroundImageUrl || null,
      backgroundImageOverlay: app.backgroundImageOverlay ?? null,
    },
  }

  const { data: existingToken, error: tokenLookupError } = await supabase
    .from('shop_design_tokens')
    .select('id')
    .eq('shop_id', shopId)
    .eq('is_active', true)
    .maybeSingle()

  if (tokenLookupError) {
    return NextResponse.json({ error: tokenLookupError.message }, { status: 500 })
  }

  if (existingToken?.id) {
    const { error: tokenUpdateError } = await supabase
      .from('shop_design_tokens')
      .update({ tokens, updated_at: new Date().toISOString() })
      .eq('id', existingToken.id)

    if (tokenUpdateError) {
      return NextResponse.json({ error: tokenUpdateError.message }, { status: 500 })
    }
  } else {
    const { error: tokenInsertError } = await supabase
      .from('shop_design_tokens')
      .insert({
        shop_id: shopId,
        tokens,
        is_active: true,
        created_by: user.id,
      })

    if (tokenInsertError) {
      return NextResponse.json({ error: tokenInsertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({
    ok: true,
    shop: updatedShop,
  })
}
