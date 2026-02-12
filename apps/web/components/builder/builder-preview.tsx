'use client'

import { useBuilder } from '@/contexts/builder-context'
import { AppPreview } from '@/components/simulator/app-preview'

export function BuilderPreview() {
  const { state, savedState, previewEnabled } = useBuilder()
  const activeState = previewEnabled ? state : savedState
  const { overview, design, navigation, web } = activeState
  const { tokens, gradients } = design

  // Build the config object for the preview
  const previewConfig = {
    eventName: overview.name || 'Conference Name',
    tagline: overview.tagline || 'Your tagline here',
    startDate: overview.startDate,
    endDate: overview.endDate,
    venueName: overview.venueName,
    logoUrl: overview.logoUrl,
    bannerUrl: overview.bannerUrl,
    colors: {
      primary: tokens?.colors?.primary || '#2563eb',
      secondary: tokens?.colors?.secondary || '#0f172a',
      accent: tokens?.colors?.accent || '#f59e0b',
      background: tokens?.colors?.background || '#ffffff',
      surface: tokens?.colors?.surface || '#f8fafc',
      text: tokens?.colors?.text || '#0f172a',
      textMuted: tokens?.colors?.textMuted || '#64748b',
      border: tokens?.colors?.border || '#e2e8f0',
      navBackground: web.navBackgroundColor,
      navText: web.navTextColor,
    },
    fonts: {
      heading: tokens?.typography?.fontFamily?.heading,
      body: tokens?.typography?.fontFamily?.body,
    },
    gradientHero: gradients?.hero,
    modules: navigation,
    cardStyle: design.cardStyle,
    iconTheme: design.iconTheme,
    hero: {
      style: web.heroStyle,
      height: web.heroHeight,
      backgroundUrl: web.heroBackgroundUrl,
      videoUrl: web.heroVideoUrl,
      overlayOpacity: web.heroOverlayOpacity,
    },
    background: {
      pattern: web.backgroundPattern as any,
      patternColor: web.backgroundPatternColor || undefined,
      gradientStart: web.backgroundGradientStart || undefined,
      gradientEnd: web.backgroundGradientEnd || undefined,
      imageUrl: web.backgroundImageUrl || undefined,
      imageOverlay: web.backgroundImageOverlay,
    },
  }

  return (
    <div className="h-full rounded-2xl border bg-white p-4 shadow-sm">
      <AppPreview config={previewConfig} className="h-full" />
    </div>
  )
}
