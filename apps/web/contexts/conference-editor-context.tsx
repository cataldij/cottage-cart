'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

// =============================================
// TYPES
// =============================================

export interface ConferenceData {
  id?: string
  slug?: string
  // Basic Info
  name: string
  tagline: string
  description: string
  startDate: string
  endDate: string
  timezone: string
  venueName: string
  venueAddress: string
  websiteUrl: string
  // Branding Assets
  logoUrl: string | null
  bannerUrl: string | null
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingColor: string
  // Navigation Colors
  navBackgroundColor: string
  navTextColor: string
  // Button Colors
  buttonColor: string
  buttonTextColor: string
  registrationButtonText: string
  // App Button Styles
  appButtonStyle: 'solid' | 'outline' | 'soft'
  appButtonColor: string
  appButtonTextColor: string
  // App Tile Layout
  appTileSize: 'sm' | 'md' | 'lg' | 'xl'
  appTileColumns: 2 | 3 | 4 | 5 | 6
  appTileLayout: 'grid' | 'row'
  appTileGap: number
  // Typography
  fontHeading: string
  fontBody: string
  // Hero Settings
  heroHeight: 'small' | 'medium' | 'large' | 'full'
  heroStyle: 'image' | 'video' | 'gradient'
  heroBackgroundUrl: string | null
  heroVideoUrl: string | null
  heroOverlayOpacity: number
  // Background Settings
  backgroundPattern: 'none' | 'dots' | 'grid' | 'diagonal' | 'zigzag'
  backgroundPatternColor: string
  backgroundGradientStart: string
  backgroundGradientEnd: string
  backgroundImageUrl: string | null
  backgroundImageOverlay: number
  // App Background Settings
  appBackgroundPattern: string | null
  appBackgroundPatternColor: string
  appBackgroundGradientStart: string
  appBackgroundGradientEnd: string
  appBackgroundImageUrl: string | null
  appBackgroundImageOverlay: number
  // App Icon Theme
  appIconTheme: 'solid' | 'outline' | 'duotone' | 'glass'
  // Footer & Legal
  footerText: string
  privacyPolicyUrl: string
  termsUrl: string
  codeOfConductUrl: string
  // Social Links
  twitterUrl: string
  linkedinUrl: string
  instagramUrl: string
  youtubeUrl: string
  // Settings
  isPublic: boolean
  isHybrid: boolean
  registrationOpen: boolean
  maxAttendees: number | null
  // Custom
  customCss: string
}

export interface NavigationModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  order: number
}

export type EditorMode = 'wizard' | 'tabs'
export type EditorStep = 'overview' | 'branding' | 'features' | 'publish'

const STEPS: EditorStep[] = ['overview', 'branding', 'features', 'publish']

interface EditorState {
  mode: EditorMode
  currentStep: EditorStep
  conference: ConferenceData
  modules: NavigationModule[]
  isDirty: boolean
  isSaving: boolean
  isPublished: boolean
}

interface EditorContextValue {
  state: EditorState
  // Navigation
  currentStep: EditorStep
  stepIndex: number
  setStep: (step: EditorStep) => void
  nextStep: () => void
  prevStep: () => void
  canGoNext: boolean
  canGoPrev: boolean
  // Mode
  mode: EditorMode
  setMode: (mode: EditorMode) => void
  // Data updates
  updateConference: (updates: Partial<ConferenceData>) => void
  toggleModule: (moduleId: string) => void
  reorderModules: (modules: NavigationModule[]) => void
  updateModule: (moduleId: string, updates: Partial<NavigationModule>) => void
  // Persistence
  save: () => Promise<void>
  publish: () => Promise<void>
  // State
  isDirty: boolean
  isSaving: boolean
  isPublished: boolean
}

// =============================================
// DEFAULT VALUES
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

const DEFAULT_CONFERENCE: ConferenceData = {
  // Basic Info
  name: '',
  tagline: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  timezone: 'America/New_York',
  venueName: '',
  venueAddress: '',
  websiteUrl: '',
  // Branding Assets
  logoUrl: null,
  bannerUrl: null,
  // Colors
  primaryColor: '#2563eb',
  secondaryColor: '#8b5cf6',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  headingColor: '#111827',
  // Navigation Colors
  navBackgroundColor: '#ffffff',
  navTextColor: '#374151',
  // Button Colors
  buttonColor: '#2563eb',
  buttonTextColor: '#ffffff',
  registrationButtonText: 'Register Now',
  // App Button Styles
  appButtonStyle: 'solid',
  appButtonColor: '#2563eb',
  appButtonTextColor: '#ffffff',
  // App Tile Layout
  appTileSize: 'md',
  appTileColumns: 3,
  appTileLayout: 'grid',
  appTileGap: 8,
  // Typography
  fontHeading: 'Inter',
  fontBody: 'Inter',
  // Hero Settings
  heroHeight: 'medium',
  heroStyle: 'gradient',
  heroBackgroundUrl: null,
  heroVideoUrl: null,
  heroOverlayOpacity: 0.3,
  // Background Settings
  backgroundPattern: 'none',
  backgroundPatternColor: '#00000010',
  backgroundGradientStart: '',
  backgroundGradientEnd: '',
  backgroundImageUrl: null,
  backgroundImageOverlay: 0.5,
  // App Background Settings
  appBackgroundPattern: null,
  appBackgroundPatternColor: '#00000010',
  appBackgroundGradientStart: '',
  appBackgroundGradientEnd: '',
  appBackgroundImageUrl: null,
  appBackgroundImageOverlay: 0.5,
  // App Icon Theme
  appIconTheme: 'solid',
  // Footer & Legal
  footerText: '',
  privacyPolicyUrl: '',
  termsUrl: '',
  codeOfConductUrl: '',
  // Social Links
  twitterUrl: '',
  linkedinUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
  // Settings
  isPublic: true,
  isHybrid: false,
  registrationOpen: true,
  maxAttendees: null,
  // Custom
  customCss: '',
}

// =============================================
// CONTEXT
// =============================================

const EditorContext = createContext<EditorContextValue | null>(null)

interface EditorProviderProps {
  children: ReactNode
  initialConference?: Partial<ConferenceData>
  initialModules?: NavigationModule[]
  mode?: EditorMode
  onSave?: (data: { conference: ConferenceData; modules: NavigationModule[] }) => Promise<void>
  onPublish?: (data: { conference: ConferenceData; modules: NavigationModule[] }) => Promise<void>
}

export function ConferenceEditorProvider({
  children,
  initialConference,
  initialModules,
  mode: initialMode = 'wizard',
  onSave,
  onPublish,
}: EditorProviderProps) {
  const [state, setState] = useState<EditorState>({
    mode: initialMode,
    currentStep: 'overview',
    conference: { ...DEFAULT_CONFERENCE, ...initialConference },
    modules: initialModules || DEFAULT_MODULES,
    isDirty: false,
    isSaving: false,
    isPublished: !!initialConference?.id,
  })

  // Step navigation
  const stepIndex = STEPS.indexOf(state.currentStep)
  const canGoNext = stepIndex < STEPS.length - 1
  const canGoPrev = stepIndex > 0

  const setStep = useCallback((step: EditorStep) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => {
      const idx = STEPS.indexOf(prev.currentStep)
      if (idx < STEPS.length - 1) {
        return { ...prev, currentStep: STEPS[idx + 1] }
      }
      return prev
    })
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => {
      const idx = STEPS.indexOf(prev.currentStep)
      if (idx > 0) {
        return { ...prev, currentStep: STEPS[idx - 1] }
      }
      return prev
    })
  }, [])

  const setMode = useCallback((mode: EditorMode) => {
    setState(prev => ({ ...prev, mode }))
  }, [])

  // Data updates
  const updateConference = useCallback((updates: Partial<ConferenceData>) => {
    setState(prev => ({
      ...prev,
      conference: { ...prev.conference, ...updates },
      isDirty: true,
    }))
  }, [])

  const toggleModule = useCallback((moduleId: string) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      ),
      isDirty: true,
    }))
  }, [])

  const reorderModules = useCallback((modules: NavigationModule[]) => {
    setState(prev => ({
      ...prev,
      modules: modules.map((m, i) => ({ ...m, order: i })),
      isDirty: true,
    }))
  }, [])

  const updateModule = useCallback((moduleId: string, updates: Partial<NavigationModule>) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m => (m.id === moduleId ? { ...m, ...updates } : m)),
      isDirty: true,
    }))
  }, [])

  // Persistence
  const save = useCallback(async () => {
    if (!onSave) return
    setState(prev => ({ ...prev, isSaving: true }))
    try {
      await onSave({ conference: state.conference, modules: state.modules })
      setState(prev => ({ ...prev, isDirty: false, isSaving: false }))
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }))
      throw error
    }
  }, [onSave, state.conference, state.modules])

  const publish = useCallback(async () => {
    if (!onPublish) return
    setState(prev => ({ ...prev, isSaving: true }))
    try {
      await onPublish({ conference: state.conference, modules: state.modules })
      setState(prev => ({ ...prev, isDirty: false, isSaving: false, isPublished: true }))
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }))
      throw error
    }
  }, [onPublish, state.conference, state.modules])

  const value: EditorContextValue = {
    state,
    currentStep: state.currentStep,
    stepIndex,
    setStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    mode: state.mode,
    setMode,
    updateConference,
    toggleModule,
    reorderModules,
    updateModule,
    save,
    publish,
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    isPublished: state.isPublished,
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useConferenceEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useConferenceEditor must be used within a ConferenceEditorProvider')
  }
  return context
}
