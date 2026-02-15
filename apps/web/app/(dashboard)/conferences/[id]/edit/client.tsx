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
      // Basic Info
      name: conference.name,
      tagline: conference.tagline || null,
      description: conference.description || null,
      start_date: conference.startDate,
      end_date: conference.endDate,
      timezone: conference.timezone,
      venue_name: conference.venueName || null,
      venue_address: conference.venueAddress || null,
      website_url: conference.websiteUrl || null,
      // Branding Assets
      logo_url: conference.logoUrl,
      banner_url: conference.bannerUrl,
      // Colors
      primary_color: conference.primaryColor,
      secondary_color: conference.secondaryColor,
      accent_color: conference.accentColor || null,
      background_color: conference.backgroundColor || null,
      text_color: conference.textColor || null,
      heading_color: conference.headingColor || null,
      // Navigation Colors
      nav_background_color: conference.navBackgroundColor || null,
      nav_text_color: conference.navTextColor || null,
      // Button Colors
      button_color: conference.buttonColor || null,
      button_text_color: conference.buttonTextColor || null,
      registration_button_text: conference.registrationButtonText || null,
      // Typography
      font_heading: conference.fontHeading || null,
      font_body: conference.fontBody || null,
      // Hero Settings
      hero_height: conference.heroHeight || null,
      hero_style: conference.heroStyle || null,
      hero_background_url: conference.heroBackgroundUrl || null,
      hero_video_url: conference.heroVideoUrl || null,
      hero_overlay_opacity: conference.heroOverlayOpacity ?? 0.3,
      // Background Settings
      background_pattern: conference.backgroundPattern || null,
      background_pattern_color: conference.backgroundPatternColor || null,
      background_gradient_start: conference.backgroundGradientStart || null,
      background_gradient_end: conference.backgroundGradientEnd || null,
      background_image_url: conference.backgroundImageUrl || null,
      background_image_overlay: conference.backgroundImageOverlay ?? 0.5,
      // Footer & Legal
      footer_text: conference.footerText || null,
      privacy_policy_url: conference.privacyPolicyUrl || null,
      terms_url: conference.termsUrl || null,
      code_of_conduct_url: conference.codeOfConductUrl || null,
      // Social Links
      twitter_url: conference.twitterUrl || null,
      linkedin_url: conference.linkedinUrl || null,
      instagram_url: conference.instagramUrl || null,
      youtube_url: conference.youtubeUrl || null,
      // Settings
      is_public: conference.isPublic,
      is_hybrid: conference.isHybrid,
      registration_open: conference.registrationOpen,
      max_attendees: conference.maxAttendees,
      // Custom
      custom_css: conference.customCss || null,
    }

    const { error } = await supabase
      .from('conferences')
      .update(payload)
      .eq('id', conferenceId)

    if (error) {
      throw new Error(error.message)
    }

    const { data: existingToken, error: existingTokenError } = await supabase
      .from('design_tokens')
      .select('id, tokens')
      .eq('conference_id', conferenceId)
      .eq('is_active', true)
      .maybeSingle()

    if (existingTokenError) {
      throw new Error(existingTokenError.message)
    }

    const existingTokens = existingToken?.tokens || {}
    const tokens = {
      ...existingTokens,
      colors: {
        ...(existingTokens.colors || {}),
        primary: conference.primaryColor,
        secondary: conference.secondaryColor,
        accent: conference.accentColor,
        background: conference.backgroundColor,
        text: conference.textColor,
      },
      typography: {
        ...(existingTokens.typography || {}),
        fontFamily: {
          ...(existingTokens.typography?.fontFamily || {}),
          heading: conference.fontHeading,
          body: conference.fontBody,
        },
      },
      app: {
        ...(existingTokens.app || {}),
        iconTheme: conference.appIconTheme,
        appButtonStyle: conference.appButtonStyle,
        appButtonColor: conference.appButtonColor,
        appButtonTextColor: conference.appButtonTextColor,
        appTileSize: conference.appTileSize,
        appTileColumns: conference.appTileColumns,
        appTileLayout: conference.appTileLayout,
        appTileGap: conference.appTileGap,
        backgroundPattern: conference.appBackgroundPattern,
        backgroundPatternColor: conference.appBackgroundPatternColor,
        backgroundGradientStart: conference.appBackgroundGradientStart,
        backgroundGradientEnd: conference.appBackgroundGradientEnd,
        backgroundImageUrl: conference.appBackgroundImageUrl,
        backgroundImageOverlay: conference.appBackgroundImageOverlay,
        modules: data.modules,
      },
    }

    if (existingToken?.id) {
      const { error: updateTokenError } = await supabase
        .from('design_tokens')
        .update({ tokens, updated_at: new Date().toISOString() })
        .eq('id', existingToken.id)
      if (updateTokenError) {
        throw new Error(updateTokenError.message)
      }
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error(userError?.message || 'Could not determine user for design token save')
      }

      const { error: insertTokenError } = await supabase
        .from('design_tokens')
        .insert({
          conference_id: conferenceId,
          tokens,
          is_active: true,
          created_by: user.id,
        })
      if (insertTokenError) {
        throw new Error(insertTokenError.message)
      }
    }
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
