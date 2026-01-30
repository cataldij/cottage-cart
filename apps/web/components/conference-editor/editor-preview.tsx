'use client'

import { useConferenceEditor } from '@/contexts/conference-editor-context'
import { AppPreview } from '@/components/simulator'

export function EditorPreview() {
  const { state } = useConferenceEditor()
  const { conference, modules } = state

  // Map context data to AppPreview config format
  const config = {
    eventName: conference.name || 'Your Conference',
    tagline: conference.tagline || undefined,
    startDate: conference.startDate,
    endDate: conference.endDate,
    venueName: conference.venueName || undefined,
    bannerUrl: conference.bannerUrl,
    logoUrl: conference.logoUrl,
    colors: {
      primary: conference.primaryColor,
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
