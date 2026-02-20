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
  const shopId = url.searchParams.get('shopId')

  const { data: shops, error: shopError } = await supabase
    .from('shops')
    .select('id, slug, name, tagline, description, location_name, location_address, logo_url, banner_url, primary_color, secondary_color, accent_color, background_color, text_color, heading_color, font_heading, font_body, nav_background_color, nav_text_color, hero_style, hero_height, hero_background_url, hero_video_url, hero_overlay_opacity, background_pattern, background_pattern_color, background_gradient_start, background_gradient_end, background_image_url, background_image_overlay, app_background_pattern, app_background_pattern_color, app_background_gradient_start, app_background_gradient_end, app_background_image_url, app_background_image_overlay, app_icon_theme')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (shopError) {
    return NextResponse.json({ error: shopError.message }, { status: 500 })
  }

  const selectedShop = shopId
    ? shops?.find((s) => s.id === shopId)
    : shops?.[0]

  if (!selectedShop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  const { data: designTokens } = await supabase
    .from('shop_design_tokens')
    .select('tokens')
    .eq('shop_id', selectedShop.id)
    .eq('is_active', true)
    .maybeSingle()

  return NextResponse.json({
    shop: selectedShop,
    designTokens: designTokens?.tokens ?? null,
  })
}
