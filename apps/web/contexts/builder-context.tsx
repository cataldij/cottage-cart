'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { DEMO_CONFERENCE, DEMO_DESIGN_TOKENS, DEMO_GRADIENTS } from '@/lib/demo-data'

// =============================================
// TYPES
// =============================================

interface ConferenceOverview {
  id?: string
  name: string
  tagline: string
  description: string
  startDate: string
  endDate: string
  venueName: string
  venueAddress: string
  logoUrl: string | null
  bannerUrl: string | null
}

interface DesignTokens {
  colors: Record<string, string>
  typography: {
    fontFamily: {
      heading: string
      body: string
      mono: string
    }
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
    lineHeight: Record<string, number>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  animation: {
    duration: Record<string, string>
    easing: Record<string, string>
  }
}

interface NavigationModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  order: number
}

interface BuilderState {
  step: number
  overview: ConferenceOverview
  design: {
    tokens: DesignTokens
    gradients: {
      hero: string
      accent: string
      card: string
    }
    darkMode: Record<string, string> | null
    cardStyle: {
      variant: 'white' | 'tinted' | 'glass'
      border: 'none' | 'primary' | 'secondary' | 'accent'
      iconStyle: 'solid' | 'outline' | 'pill'
    }
    iconTheme: 'solid' | 'outline' | 'duotone' | 'glass'
  }
  navigation: NavigationModule[]
  publish: {
    eventCode: string
    attendeeUrl: string
    isPublished: boolean
  }
  web: {
    navBackgroundColor: string
    navTextColor: string
    heroStyle: 'image' | 'video' | 'gradient'
    heroHeight: 'small' | 'medium' | 'large' | 'full'
    heroBackgroundUrl: string | null
    heroVideoUrl: string | null
    heroOverlayOpacity: number
    backgroundPattern: string | null
    backgroundPatternColor: string | null
    backgroundGradientStart: string | null
    backgroundGradientEnd: string | null
    backgroundImageUrl: string | null
    backgroundImageOverlay: number
  }
}

interface BuilderContextValue {
  state: BuilderState
  savedState: BuilderState
  previewEnabled: boolean
  setPreviewEnabled: (enabled: boolean) => void
  saveDraft: () => Promise<void>
  // Step navigation
  currentStep: number
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  canGoNext: boolean
  canGoPrev: boolean
  // Overview
  updateOverview: (updates: Partial<ConferenceOverview>) => void
  // Design
  updateDesignTokens: (tokens: DesignTokens) => void
  updateGradients: (gradients: BuilderState['design']['gradients']) => void
  updateCardStyle: (cardStyle: BuilderState['design']['cardStyle']) => void
  updateIconTheme: (iconTheme: BuilderState['design']['iconTheme']) => void
  updateWebSettings: (updates: Partial<BuilderState['web']>) => void
  // Navigation
  toggleModule: (moduleId: string) => void
  reorderModules: (modules: NavigationModule[]) => void
  // Publish
  generateEventCode: () => void
  hydrateFromServer: (data: Partial<BuilderState>) => void
}

// =============================================
// DEFAULT STATE
// =============================================

const DEFAULT_MODULES: NavigationModule[] = [
  { id: 'home', name: 'Home', icon: 'Home', enabled: true, order: 0 },
  { id: 'schedule', name: 'Schedule', icon: 'Calendar', enabled: true, order: 1 },
  { id: 'speakers', name: 'Speakers', icon: 'Users', enabled: true, order: 2 },
  { id: 'sponsors', name: 'Sponsors', icon: 'Building2', enabled: true, order: 3 },
  { id: 'networking', name: 'Networking', icon: 'MessageCircle', enabled: true, order: 4 },
  { id: 'map', name: 'Venue Map', icon: 'Map', enabled: true, order: 5 },
  { id: 'notifications', name: 'Notifications', icon: 'Bell', enabled: true, order: 6 },
  { id: 'profile', name: 'My Profile', icon: 'User', enabled: true, order: 7 },
]

const DEFAULT_STATE: BuilderState = {
  step: 0,
  overview: {
    id: DEMO_CONFERENCE.id,
    name: DEMO_CONFERENCE.name,
    tagline: DEMO_CONFERENCE.tagline || '',
    description: DEMO_CONFERENCE.description || '',
    startDate: DEMO_CONFERENCE.start_date,
    endDate: DEMO_CONFERENCE.end_date,
    venueName: DEMO_CONFERENCE.venue_name || '',
    venueAddress: DEMO_CONFERENCE.venue_address || '',
    logoUrl: null,
    bannerUrl: null,
  },
  design: {
    tokens: DEMO_DESIGN_TOKENS as unknown as DesignTokens,
    gradients: DEMO_GRADIENTS,
    darkMode: null,
    cardStyle: {
      variant: 'white',
      border: 'primary',
      iconStyle: 'solid',
    },
    iconTheme: 'solid',
  },
  navigation: DEFAULT_MODULES,
  publish: {
    eventCode: '',
    attendeeUrl: '',
    isPublished: false,
  },
  web: {
    navBackgroundColor: '#ffffff',
    navTextColor: '#374151',
    heroStyle: 'gradient',
    heroHeight: 'medium',
    heroBackgroundUrl: null,
    heroVideoUrl: null,
    heroOverlayOpacity: 0.3,
    backgroundPattern: null,
    backgroundPatternColor: '#00000010',
    backgroundGradientStart: null,
    backgroundGradientEnd: null,
    backgroundImageUrl: null,
    backgroundImageOverlay: 0.5,
  },
}

// =============================================
// CONTEXT
// =============================================

const BuilderContext = createContext<BuilderContextValue | null>(null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BuilderState>(DEFAULT_STATE)
  const [savedState, setSavedState] = useState<BuilderState>(DEFAULT_STATE)
  const [previewEnabled, setPreviewEnabled] = useState(false)

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, step: Math.max(0, Math.min(3, step)) }))
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.min(3, prev.step + 1) }))
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }))
  }, [])

  const updateOverview = useCallback((updates: Partial<ConferenceOverview>) => {
    setState(prev => ({
      ...prev,
      overview: { ...prev.overview, ...updates },
    }))
  }, [])

  const updateDesignTokens = useCallback((tokens: DesignTokens) => {
    setState(prev => ({
      ...prev,
      design: { ...prev.design, tokens },
    }))
  }, [])

  const updateGradients = useCallback((gradients: BuilderState['design']['gradients']) => {
    setState(prev => ({
      ...prev,
      design: { ...prev.design, gradients },
    }))
  }, [])

  const updateCardStyle = useCallback((cardStyle: BuilderState['design']['cardStyle']) => {
    setState(prev => ({
      ...prev,
      design: { ...prev.design, cardStyle },
    }))
  }, [])

  const updateIconTheme = useCallback((iconTheme: BuilderState['design']['iconTheme']) => {
    setState(prev => ({
      ...prev,
      design: { ...prev.design, iconTheme },
    }))
  }, [])

  const updateWebSettings = useCallback((updates: Partial<BuilderState['web']>) => {
    setState(prev => ({
      ...prev,
      web: { ...prev.web, ...updates },
    }))
  }, [])

  const toggleModule = useCallback((moduleId: string) => {
    setState(prev => ({
      ...prev,
      navigation: prev.navigation.map(m =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      ),
    }))
  }, [])

  const reorderModules = useCallback((modules: NavigationModule[]) => {
    setState(prev => ({
      ...prev,
      navigation: modules.map((m, i) => ({ ...m, order: i })),
    }))
  }, [])

  const generateEventCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setState(prev => ({
      ...prev,
      publish: {
        eventCode: code,
        attendeeUrl: `https://conference-os.vercel.app/c/${code.toLowerCase()}`,
        isPublished: true,
      },
    }))
  }, [])

  const hydrateFromServer = useCallback((data: Partial<BuilderState>) => {
    setState(prev => ({
      ...prev,
      ...data,
      overview: { ...prev.overview, ...(data.overview || {}) },
      design: {
        ...prev.design,
        ...(data.design || {}),
        tokens: data.design?.tokens || prev.design.tokens,
        gradients: data.design?.gradients || prev.design.gradients,
        cardStyle: data.design?.cardStyle || prev.design.cardStyle,
        darkMode: data.design?.darkMode ?? prev.design.darkMode,
        iconTheme: data.design?.iconTheme || prev.design.iconTheme,
      },
      navigation: data.navigation || prev.navigation,
      web: { ...prev.web, ...(data.web || {}) },
    }))
  }, [])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const response = await fetch('/api/builder/state')
        if (!response.ok) return
        const data = await response.json()

        if (!isMounted) return

        const conference = data.conference
        const tokens = data.designTokens
        const baseTokens = tokens || {
          ...DEFAULT_STATE.design.tokens,
          colors: {
            ...DEFAULT_STATE.design.tokens.colors,
            primary: conference?.primary_color || DEFAULT_STATE.design.tokens.colors.primary,
            secondary: conference?.secondary_color || DEFAULT_STATE.design.tokens.colors.secondary,
            accent: conference?.accent_color || DEFAULT_STATE.design.tokens.colors.accent,
            background: conference?.background_color || DEFAULT_STATE.design.tokens.colors.background,
          },
          typography: {
            ...DEFAULT_STATE.design.tokens.typography,
            fontFamily: {
              ...DEFAULT_STATE.design.tokens.typography.fontFamily,
              heading: conference?.font_heading || DEFAULT_STATE.design.tokens.typography.fontFamily.heading,
              body: conference?.font_body || DEFAULT_STATE.design.tokens.typography.fontFamily.body,
            },
          },
        }

        const hydrated: Partial<BuilderState> = {
          overview: {
            id: conference?.id,
            name: conference?.name || '',
            tagline: conference?.tagline || '',
            description: conference?.description || '',
            startDate: conference?.start_date || '',
            endDate: conference?.end_date || '',
            venueName: conference?.venue_name || '',
            venueAddress: conference?.venue_address || '',
            logoUrl: conference?.logo_url || null,
            bannerUrl: conference?.banner_url || null,
          },
          design: {
            tokens: baseTokens,
            iconTheme: (tokens?.app?.iconTheme as BuilderState['design']['iconTheme']) || 'solid',
          },
          web: {
            navBackgroundColor: conference?.nav_background_color || '#ffffff',
            navTextColor: conference?.nav_text_color || '#374151',
            heroStyle: conference?.hero_style || 'gradient',
            heroHeight: conference?.hero_height || 'medium',
            heroBackgroundUrl: conference?.hero_background_url || null,
            heroVideoUrl: conference?.hero_video_url || null,
            heroOverlayOpacity: conference?.hero_overlay_opacity ?? 0.3,
            backgroundPattern: conference?.background_pattern || null,
            backgroundPatternColor: conference?.background_pattern_color || '#00000010',
            backgroundGradientStart: conference?.background_gradient_start || null,
            backgroundGradientEnd: conference?.background_gradient_end || null,
            backgroundImageUrl: conference?.background_image_url || null,
            backgroundImageOverlay: conference?.background_image_overlay ?? 0.5,
          },
        }

        hydrateFromServer(hydrated)
        setSavedState(prev => ({ ...prev, ...hydrated } as BuilderState))
      } catch (error) {
        console.error('Failed to load builder state:', error)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveDraft = useCallback(async () => {
    await fetch('/api/builder/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    setSavedState(state)
  }, [state])

  const value: BuilderContextValue = {
    state,
    savedState,
    previewEnabled,
    setPreviewEnabled,
    saveDraft,
    currentStep: state.step,
    setStep,
    nextStep,
    prevStep,
    canGoNext: state.step < 3,
    canGoPrev: state.step > 0,
    updateOverview,
    updateDesignTokens,
    updateGradients,
    updateCardStyle,
    updateIconTheme,
    updateWebSettings,
    toggleModule,
    reorderModules,
    generateEventCode,
    hydrateFromServer,
  }

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider')
  }
  return context
}
