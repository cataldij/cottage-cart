'use client'

import { useConferenceEditor } from '@/contexts/conference-editor-context'
import { AppPreview } from '@/components/simulator'

export function EditorPreview() {
  const { state } = useConferenceEditor()
  const { conference, modules } = state

  // Map context data to AppPreview config format
  // All design settings are passed so preview updates in real-time
  const config = {
    eventName: conference.name || 'Your Conference',
    tagline: conference.tagline || undefined,
    startDate: conference.startDate,
    endDate: conference.endDate,
    venueName: conference.venueName || undefined,
    bannerUrl: conference.bannerUrl,
    logoUrl: conference.logoUrl,
    registrationButtonText: conference.registrationButtonText || 'Register Now',
    colors: {
      primary: conference.primaryColor || '#2563eb',
      secondary: conference.secondaryColor || '#8b5cf6',
      accent: conference.accentColor || '#f59e0b',
      background: conference.backgroundColor || '#ffffff',
      text: conference.textColor || '#1f2937',
      heading: conference.headingColor || '#111827',
      navBackground: conference.navBackgroundColor || '#ffffff',
      navText: conference.navTextColor || '#374151',
      button: conference.buttonColor || conference.primaryColor || '#2563eb',
      buttonText: conference.buttonTextColor || '#ffffff',
    },
    fonts: {
      heading: conference.fontHeading || 'Inter',
      body: conference.fontBody || 'Inter',
    },
    hero: {
      height: conference.heroHeight || 'medium',
      style: conference.heroStyle || 'gradient',
      backgroundUrl: conference.heroBackgroundUrl,
      videoUrl: conference.heroVideoUrl,
      overlayOpacity: conference.heroOverlayOpacity ?? 0.3,
    },
    background: {
      pattern: conference.backgroundPattern || 'none',
      patternColor: conference.backgroundPatternColor || '#00000010',
      gradientStart: conference.backgroundGradientStart,
      gradientEnd: conference.backgroundGradientEnd,
      imageUrl: conference.backgroundImageUrl,
      imageOverlay: conference.backgroundImageOverlay ?? 0.5,
    },
    modules: modules.map(m => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      enabled: m.enabled,
      order: m.order,
    })),
  }

  return (
    <div className="h-full rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-100 to-slate-200 p-4 shadow-sm">
      <AppPreview config={config} />
    </div>
  )
}
