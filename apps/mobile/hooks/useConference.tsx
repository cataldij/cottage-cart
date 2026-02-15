import { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react'
import { Conference, ConferenceMember, supabase } from '@conference-os/api'
import { DesignTokens, DEFAULT_TOKENS } from './useDesignTokens'

// Conference theme derived from design tokens
interface ConferenceTheme {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingColor: string
  navBackgroundColor: string
  navTextColor: string
  buttonColor: string
  buttonTextColor: string

  // Mobile-specific
  splashColor: string
  iconBackgroundColor: string
  statusBarStyle: 'light' | 'dark'
  tabBarColor: string
  tabBarActiveColor: string

  // Background
  backgroundImageUrl: string | null
  backgroundImageOverlay: number
  backgroundPattern: string | null
  backgroundPatternColor: string | null
  backgroundGradientStart: string | null
  backgroundGradientEnd: string | null
  gradientHero: string | null

  // Typography
  fontHeading: string
  fontBody: string

  // Feature flags
  networkingEnabled: boolean
  attendeeDirectoryEnabled: boolean
  sessionQaEnabled: boolean
  livePollsEnabled: boolean
  chatEnabled: boolean
  sessionRatingsEnabled: boolean
  virtualBadgesEnabled: boolean
  meetingRequestsEnabled: boolean
  sponsorBoothsEnabled: boolean
  liveStreamEnabled: boolean
  recordingsEnabled: boolean
  certificatesEnabled: boolean
}

interface ConferenceContextType {
  // Current active conference (the "channel" user is viewing)
  activeConference: Conference | null
  setActiveConference: (conference: Conference | null) => void

  // User's membership in the active conference
  membership: ConferenceMember | null
  setMembership: (membership: ConferenceMember | null) => void

  // Conference theme (for channel branding)
  theme: ConferenceTheme

  // Full design tokens from builder
  designTokens: DesignTokens
  designTokensLoading: boolean

  // Legacy - for backwards compatibility
  accentColor: string
}

const defaultTheme: ConferenceTheme = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  headingColor: '#111827',
  navBackgroundColor: '#ffffff',
  navTextColor: '#374151',
  buttonColor: '#2563eb',
  buttonTextColor: '#ffffff',
  splashColor: '#2563eb',
  iconBackgroundColor: '#2563eb',
  statusBarStyle: 'light',
  tabBarColor: '#ffffff',
  tabBarActiveColor: '#2563eb',
  backgroundImageUrl: null,
  backgroundImageOverlay: 0.5,
  backgroundPattern: null,
  backgroundPatternColor: null,
  backgroundGradientStart: null,
  backgroundGradientEnd: null,
  gradientHero: null,
  fontHeading: 'Inter',
  fontBody: 'Inter',
  networkingEnabled: true,
  attendeeDirectoryEnabled: true,
  sessionQaEnabled: true,
  livePollsEnabled: true,
  chatEnabled: true,
  sessionRatingsEnabled: true,
  virtualBadgesEnabled: true,
  meetingRequestsEnabled: true,
  sponsorBoothsEnabled: true,
  liveStreamEnabled: false,
  recordingsEnabled: true,
  certificatesEnabled: false,
}

const ConferenceContext = createContext<ConferenceContextType | undefined>(undefined)

export function ConferenceProvider({ children }: { children: ReactNode }) {
  const [activeConference, setActiveConference] = useState<Conference | null>(null)
  const [membership, setMembership] = useState<ConferenceMember | null>(null)
  const [designTokens, setDesignTokens] = useState<DesignTokens>(DEFAULT_TOKENS)
  const [designTokensLoading, setDesignTokensLoading] = useState(false)

  // Fetch design tokens when conference changes
  useEffect(() => {
    if (!activeConference?.id) {
      setDesignTokens(DEFAULT_TOKENS)
      return
    }

    const fetchDesignTokens = async () => {
      setDesignTokensLoading(true)
      try {
        const { data, error } = await supabase
          .from('design_tokens')
          .select('tokens')
          .eq('conference_id', activeConference.id)
          .eq('is_active', true)
          .single()

        if (error) {
          // No custom design - use defaults
          if (error.code === 'PGRST116') {
            console.log('No design tokens for conference, using defaults')
          } else {
            console.error('Error fetching design tokens:', error)
          }
          setDesignTokens(DEFAULT_TOKENS)
        } else if (data?.tokens) {
          // Merge with defaults in case some fields are missing
          setDesignTokens(deepMerge(DEFAULT_TOKENS, data.tokens as Partial<DesignTokens>))
        }
      } catch (err) {
        console.error('Error fetching design tokens:', err)
        setDesignTokens(DEFAULT_TOKENS)
      } finally {
        setDesignTokensLoading(false)
      }
    }

    fetchDesignTokens()

    // Subscribe to realtime updates - live sync from builder!
    const channel = supabase
      .channel(`design_tokens:${activeConference.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'design_tokens',
          filter: `conference_id=eq.${activeConference.id}`,
        },
        (payload) => {
          console.log('Design tokens updated in real-time:', payload)
          fetchDesignTokens()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeConference?.id])

  // Build theme from design tokens (primary source) and conference settings (fallback)
  const theme = useMemo<ConferenceTheme>(() => {
    if (!activeConference) return defaultTheme

    const c = activeConference as any // Type assertion for all the new fields
    const tokens = designTokens
    const appTokens = tokens.app || {}
    const appPattern =
      appTokens.backgroundPattern && appTokens.backgroundPattern !== 'none'
        ? appTokens.backgroundPattern
        : null
    const conferencePattern =
      c.background_pattern && c.background_pattern !== 'none'
        ? c.background_pattern
        : null

    return {
      // Colors - prefer design tokens, fallback to conference settings
      primaryColor: tokens.colors?.primary || c.primary_color || defaultTheme.primaryColor,
      secondaryColor: tokens.colors?.secondary || c.secondary_color || defaultTheme.secondaryColor,
      accentColor: tokens.colors?.accent || c.accent_color || defaultTheme.accentColor,
      backgroundColor: tokens.colors?.background || c.background_color || defaultTheme.backgroundColor,
      textColor: tokens.colors?.text || c.text_color || defaultTheme.textColor,
      headingColor: tokens.colors?.text || c.heading_color || defaultTheme.headingColor,
      navBackgroundColor: tokens.colors?.surface || c.nav_background_color || defaultTheme.navBackgroundColor,
      navTextColor: tokens.colors?.textMuted || c.nav_text_color || defaultTheme.navTextColor,
      buttonColor: tokens.colors?.primary || c.button_color || c.primary_color || defaultTheme.buttonColor,
      buttonTextColor: c.button_text_color || defaultTheme.buttonTextColor,

      // Mobile-specific
      splashColor: tokens.mobile?.splashBackgroundColor || tokens.colors?.primary || c.mobile_splash_color || c.primary_color || defaultTheme.splashColor,
      iconBackgroundColor: tokens.colors?.primary || c.mobile_icon_background_color || c.primary_color || defaultTheme.iconBackgroundColor,
      statusBarStyle: tokens.mobile?.statusBarStyle || c.mobile_status_bar_style || defaultTheme.statusBarStyle,
      tabBarColor: tokens.colors?.background || c.mobile_tab_bar_color || defaultTheme.tabBarColor,
      tabBarActiveColor: tokens.colors?.primary || c.mobile_tab_bar_active_color || c.primary_color || defaultTheme.tabBarActiveColor,

      // Background
      backgroundImageUrl: appTokens.backgroundImageUrl || c.background_image_url || null,
      backgroundImageOverlay: appTokens.backgroundImageOverlay ?? c.background_image_overlay ?? 0.5,
      backgroundPattern: appPattern || conferencePattern,
      backgroundPatternColor: appTokens.backgroundPatternColor || c.background_pattern_color || null,
      backgroundGradientStart: appTokens.backgroundGradientStart || c.background_gradient_start || null,
      backgroundGradientEnd: appTokens.backgroundGradientEnd || c.background_gradient_end || null,
      gradientHero: tokens.mobile?.gradientHero || null,

      // Typography
      fontHeading: tokens.typography?.fontFamily?.heading || c.font_heading || defaultTheme.fontHeading,
      fontBody: tokens.typography?.fontFamily?.body || c.font_body || defaultTheme.fontBody,

      // Feature flags (from conference settings, not tokens)
      networkingEnabled: c.feature_networking !== false,
      attendeeDirectoryEnabled: c.feature_attendee_directory !== false,
      sessionQaEnabled: c.feature_session_qa !== false,
      livePollsEnabled: c.feature_live_polls !== false,
      chatEnabled: c.feature_chat !== false,
      sessionRatingsEnabled: c.feature_session_ratings !== false,
      virtualBadgesEnabled: c.feature_virtual_badges !== false,
      meetingRequestsEnabled: c.feature_meeting_requests !== false,
      sponsorBoothsEnabled: c.feature_sponsor_booths !== false,
      liveStreamEnabled: c.feature_live_stream === true,
      recordingsEnabled: c.feature_recordings !== false,
      certificatesEnabled: c.feature_certificates === true,
    }
  }, [activeConference, designTokens])

  // Legacy - for backwards compatibility
  const accentColor = theme.primaryColor

  const value: ConferenceContextType = {
    activeConference,
    setActiveConference,
    membership,
    setMembership,
    theme,
    designTokens,
    designTokensLoading,
    accentColor,
  }

  return (
    <ConferenceContext.Provider value={value}>
      {children}
    </ConferenceContext.Provider>
  )
}

export function useConference() {
  const context = useContext(ConferenceContext)
  if (context === undefined) {
    throw new Error('useConference must be used within a ConferenceProvider')
  }
  return context
}

// Helper function for deep merging objects
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof (target as any)[key] === 'object' &&
        (target as any)[key] !== null
      ) {
        (result as any)[key] = deepMerge((target as any)[key], source[key] as any)
      } else {
        (result as any)[key] = source[key]
      }
    }
  }

  return result
}
