'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { DEMO_CONFERENCE, DEMO_DESIGN_TOKENS } from '@/lib/demo-data'
import { StorefrontSection, DEFAULT_SECTIONS } from '@/lib/builder-sections'
import type { BuilderTemplate } from '@/lib/builder-templates'

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
  app: {
    backgroundPattern: string | null
    backgroundPatternColor: string | null
    backgroundGradientStart: string | null
    backgroundGradientEnd: string | null
    backgroundImageUrl: string | null
    backgroundImageOverlay: number
  }
  sections: StorefrontSection[]
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
  isSaving: boolean
  lastSavedAt: string | null
  saveError: string | null
  isAuthenticated: boolean | null
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
  updateAppSettings: (updates: Partial<BuilderState['app']>) => void
  // Sections
  updateSections: (sections: StorefrontSection[]) => void
  // Templates
  applyTemplate: (template: BuilderTemplate) => void
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
  { id: 'catalog', name: 'Catalog', icon: 'ShoppingBag', enabled: true, order: 1 },
  { id: 'orders', name: 'Orders', icon: 'ClipboardList', enabled: true, order: 2 },
  { id: 'pickup', name: 'Pickup', icon: 'MapPin', enabled: true, order: 3 },
  { id: 'reviews', name: 'Reviews', icon: 'Star', enabled: true, order: 4 },
  { id: 'messages', name: 'Messages', icon: 'MessageCircle', enabled: true, order: 5 },
  { id: 'account', name: 'Account', icon: 'User', enabled: true, order: 6 },
]

const DEFAULT_MAKER_TOKENS: DesignTokens = {
  ...(DEMO_DESIGN_TOKENS as unknown as DesignTokens),
  colors: {
    ...(DEMO_DESIGN_TOKENS.colors || {}),
    primary: '#4E6E52',
    primaryLight: '#6F8B73',
    primaryDark: '#36503A',
    secondary: '#7A5C45',
    secondaryLight: '#9A7A61',
    secondaryDark: '#5E4331',
    accent: '#C66A3D',
    accentLight: '#DA8C62',
    accentDark: '#A7542C',
    background: '#F7F2E8',
    surface: '#FFF9EF',
    surfaceHover: '#F1E8D9',
    text: '#2F241D',
    textMuted: '#74665B',
    textInverse: '#FFFDF8',
    border: '#DFCFBC',
  },
  typography: {
    ...(DEMO_DESIGN_TOKENS.typography || {}),
    fontFamily: {
      ...(DEMO_DESIGN_TOKENS.typography?.fontFamily || {}),
      heading: 'Playfair Display',
      body: 'DM Sans',
      mono: 'JetBrains Mono',
    },
  },
}

const DEFAULT_STATE: BuilderState = {
  step: 0,
  overview: {
    id: DEMO_CONFERENCE.id,
    name: "Maker's Market Demo Shop",
    tagline: 'Fresh from a local kitchen, ready for pickup.',
    description: 'Small-batch breads, pastries, and seasonal treats made for our neighborhood.',
    startDate: DEMO_CONFERENCE.start_date,
    endDate: DEMO_CONFERENCE.end_date,
    venueName: 'Front Porch Pickup',
    venueAddress: '123 Maple St, Hometown, USA',
    logoUrl: null,
    bannerUrl: null,
  },
  design: {
    tokens: DEFAULT_MAKER_TOKENS,
    gradients: {
      hero: 'linear-gradient(135deg, #4E6E52 0%, #7A5C45 55%, #C66A3D 100%)',
      accent: 'linear-gradient(90deg, #4E6E52, #C66A3D)',
      card: 'linear-gradient(180deg, #FFF9EF 0%, #F3E8D6 100%)',
    },
    darkMode: null,
    cardStyle: {
      variant: 'tinted',
      border: 'secondary',
      iconStyle: 'pill',
    },
    iconTheme: 'duotone',
  },
  app: {
    backgroundPattern: null,
    backgroundPatternColor: '#00000010',
    backgroundGradientStart: null,
    backgroundGradientEnd: null,
    backgroundImageUrl: null,
    backgroundImageOverlay: 0.5,
  },
  sections: DEFAULT_SECTIONS,
  navigation: DEFAULT_MODULES,
  publish: {
    eventCode: '',
    attendeeUrl: '',
    isPublished: false,
  },
  web: {
    navBackgroundColor: '#FFF8EE',
    navTextColor: '#4E6E52',
    heroStyle: 'image',
    heroHeight: 'medium',
    heroBackgroundUrl: 'https://images.pexels.com/photos/2280545/pexels-photo-2280545.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroVideoUrl: null,
    heroOverlayOpacity: 0.28,
    backgroundPattern: null,
    backgroundPatternColor: '#00000010',
    backgroundGradientStart: '#FFF9EF',
    backgroundGradientEnd: '#F3E6D1',
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
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

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

  const updateAppSettings = useCallback((updates: Partial<BuilderState['app']>) => {
    setState(prev => ({
      ...prev,
      app: { ...prev.app, ...updates },
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

  const updateSections = useCallback((sections: StorefrontSection[]) => {
    setState(prev => ({ ...prev, sections }))
  }, [])

  const applyTemplate = useCallback((template: BuilderTemplate) => {
    setState(prev => ({
      ...prev,
      sections: template.sections,
      design: {
        ...prev.design,
        tokens: {
          ...prev.design.tokens,
          colors: {
            ...prev.design.tokens.colors,
            primary: template.colors.primary,
            secondary: template.colors.secondary,
            accent: template.colors.accent,
            background: template.colors.background,
            surface: template.colors.surface,
            text: template.colors.text,
            textMuted: template.colors.textMuted,
            border: template.colors.border,
          },
          typography: {
            ...prev.design.tokens.typography,
            fontFamily: {
              ...prev.design.tokens.typography.fontFamily,
              heading: template.fonts.heading,
              body: template.fonts.body,
            },
          },
        },
        gradients: template.gradients,
        cardStyle: template.cardStyle as BuilderState['design']['cardStyle'],
      },
      web: {
        ...prev.web,
        heroStyle: template.heroSettings.style,
        heroHeight: template.heroSettings.height as BuilderState['web']['heroHeight'],
        heroOverlayOpacity: template.heroSettings.overlayOpacity,
      },
    }))
  }, [])

  const generateEventCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setState(prev => ({
      ...prev,
      publish: {
        eventCode: code,
        attendeeUrl: prev.publish.attendeeUrl || 'https://cottage-cart.vercel.app/shop/demo',
        isPublished: true,
      },
    }))
  }, [])

  const hydrateFromServer = useCallback((data: Partial<BuilderState>) => {
    setState(prev => ({
      ...prev,
      ...data,
      sections: data.sections || prev.sections,
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
      app: { ...prev.app, ...(data.app || {}) },
    }))
  }, [])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const response = await fetch('/api/builder/state')
        if (response.status === 401) {
          if (isMounted) setIsAuthenticated(false)
          return
        }
        if (isMounted) setIsAuthenticated(true)
        if (!response.ok) return
        const data = await response.json()

        if (!isMounted) return

        const shop = data.shop || data.conference
        const tokens = data.designTokens
        const baseTokens = tokens || {
          ...DEFAULT_STATE.design.tokens,
          colors: {
            ...DEFAULT_STATE.design.tokens.colors,
            primary: shop?.primary_color || DEFAULT_STATE.design.tokens.colors.primary,
            secondary: shop?.secondary_color || DEFAULT_STATE.design.tokens.colors.secondary,
            accent: shop?.accent_color || DEFAULT_STATE.design.tokens.colors.accent,
            background: shop?.background_color || DEFAULT_STATE.design.tokens.colors.background,
            text: shop?.text_color || DEFAULT_STATE.design.tokens.colors.text,
          },
          typography: {
            ...DEFAULT_STATE.design.tokens.typography,
            fontFamily: {
              ...DEFAULT_STATE.design.tokens.typography.fontFamily,
              heading: shop?.font_heading || DEFAULT_STATE.design.tokens.typography.fontFamily.heading,
              body: shop?.font_body || DEFAULT_STATE.design.tokens.typography.fontFamily.body,
            },
          },
        }

        const parseNumberish = (value: unknown, fallback: number) => {
          if (value === null || value === undefined || value === '') return fallback
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : fallback
        }

        const serverSections = tokens?.sections as StorefrontSection[] | undefined

        const hydrated: Partial<BuilderState> = {
          sections: (serverSections && serverSections.length > 0) ? serverSections : DEFAULT_SECTIONS,
          overview: {
            id: shop?.id,
            name: shop?.name || '',
            tagline: shop?.tagline || '',
            description: shop?.description || '',
            startDate: '',
            endDate: '',
            venueName: shop?.location_name || shop?.venue_name || '',
            venueAddress: shop?.location_address || shop?.venue_address || '',
            logoUrl: shop?.logo_url || null,
            bannerUrl: shop?.banner_url || null,
          },
          design: {
            tokens: baseTokens,
            gradients: tokens?.gradients || DEFAULT_STATE.design.gradients,
            darkMode: DEFAULT_STATE.design.darkMode,
            iconTheme: (tokens?.app?.iconTheme as BuilderState['design']['iconTheme']) || 'solid',
            cardStyle: (tokens?.app?.cardStyle as BuilderState['design']['cardStyle']) || DEFAULT_STATE.design.cardStyle,
          },
          web: {
            navBackgroundColor: shop?.nav_background_color || '#ffffff',
            navTextColor: shop?.nav_text_color || '#374151',
            heroStyle: shop?.hero_style || 'gradient',
            heroHeight: shop?.hero_height || 'medium',
            heroBackgroundUrl: shop?.hero_background_url || null,
            heroVideoUrl: shop?.hero_video_url || null,
            heroOverlayOpacity: parseNumberish(shop?.hero_overlay_opacity, 0.3),
            backgroundPattern: shop?.background_pattern || null,
            backgroundPatternColor: shop?.background_pattern_color || '#00000010',
            backgroundGradientStart: shop?.background_gradient_start || null,
            backgroundGradientEnd: shop?.background_gradient_end || null,
            backgroundImageUrl: shop?.background_image_url || null,
            backgroundImageOverlay: parseNumberish(shop?.background_image_overlay, 0.5),
          },
          app: {
            backgroundPattern: tokens?.app?.backgroundPattern || shop?.app_background_pattern || null,
            backgroundPatternColor: tokens?.app?.backgroundPatternColor || shop?.app_background_pattern_color || '#00000010',
            backgroundGradientStart: tokens?.app?.backgroundGradientStart || shop?.app_background_gradient_start || null,
            backgroundGradientEnd: tokens?.app?.backgroundGradientEnd || shop?.app_background_gradient_end || null,
            backgroundImageUrl: tokens?.app?.backgroundImageUrl || shop?.app_background_image_url || null,
            backgroundImageOverlay: parseNumberish(tokens?.app?.backgroundImageOverlay ?? shop?.app_background_image_overlay, 0.5),
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
    try {
      setIsSaving(true)
      setSaveError(null)
      const res = await fetch('/api/builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = res.status === 401
          ? 'Not logged in - please sign in first'
          : res.status === 400
            ? 'No shop found - create one first'
            : data.error || `Save failed (${res.status})`
        setSaveError(msg)
        return
      }
      const result = await res.json().catch(() => null)
      if (result?.shop) {
        const shopId = result.shop.id as string | undefined
        const shopSlug = result.shop.slug as string | undefined
        setState(prev => ({
          ...prev,
          overview: {
            ...prev.overview,
            id: shopId || prev.overview.id,
          },
          publish: {
            ...prev.publish,
            attendeeUrl: shopSlug
              ? `${window.location.origin}/shop/${shopSlug}`
              : prev.publish.attendeeUrl,
          },
        }))
      }
      setSavedState(state)
      setLastSavedAt(new Date().toISOString())
    } catch (err) {
      setSaveError('Network error - could not reach server')
    } finally {
      setIsSaving(false)
    }
  }, [state])

  const value: BuilderContextValue = {
    state,
    savedState,
    previewEnabled,
    setPreviewEnabled,
    saveDraft,
    isSaving,
    lastSavedAt,
    saveError,
    isAuthenticated,
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
    updateAppSettings,
    updateSections,
    applyTemplate,
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
