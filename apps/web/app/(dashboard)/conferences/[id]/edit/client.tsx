'use client'

import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  ConferenceEditorProvider,
  type ConferenceData,
  type NavigationModule,
} from '@/contexts/conference-editor-context'
import { EditorStepper, EditorContent, EditorPreview } from '@/components/conference-editor'

interface Props {
  conferenceId: string
  initialConference: Partial<ConferenceData>
  initialModules?: NavigationModule[]
}

export function ConferenceEditorClient({
  conferenceId,
  initialConference,
  initialModules,
}: Props) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSave = async (data: {
    conference: ConferenceData
    modules: NavigationModule[]
  }) => {
    const { conference } = data

    // Map editor format back to database format
    const payload = {
      name: conference.name,
      tagline: conference.tagline || null,
      description: conference.description || null,
      start_date: conference.startDate,
      end_date: conference.endDate,
      timezone: conference.timezone,
      venue_name: conference.venueName || null,
      venue_address: conference.venueAddress || null,
      logo_url: conference.logoUrl,
      banner_url: conference.bannerUrl,
      primary_color: conference.primaryColor,
      secondary_color: conference.secondaryColor,
      website_url: conference.websiteUrl || null,
      is_public: conference.isPublic,
      is_hybrid: conference.isHybrid,
      registration_open: conference.registrationOpen,
      max_attendees: conference.maxAttendees,
    }

    const { error } = await supabase
      .from('conferences')
      .update(payload)
      .eq('id', conferenceId)

    if (error) {
      throw new Error(error.message)
    }

    // TODO: Save modules to a separate table if needed
  }

  const handlePublish = async (data: {
    conference: ConferenceData
    modules: NavigationModule[]
  }) => {
    // First save
    await handleSave(data)

    // Then mark as published (could set a published_at timestamp, etc.)
    // For now, just redirect to the live page
    const slug =
      data.conference.slug ||
      data.conference.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    // Open in new tab
    window.open(`/c/${slug}`, '_blank')
  }

  return (
    <ConferenceEditorProvider
      initialConference={initialConference}
      initialModules={initialModules}
      mode="tabs" // Editing existing = tabs mode
      onSave={handleSave}
      onPublish={handlePublish}
    >
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
        {/* Stepper */}
        <EditorStepper />

        {/* Main Content */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Left: Step Content */}
          <div className="flex-1 overflow-y-auto">
            <EditorContent />
          </div>

          {/* Right: Live Preview */}
          <div className="w-[400px] shrink-0">
            <EditorPreview />
          </div>
        </div>
      </div>
    </ConferenceEditorProvider>
  )
}
