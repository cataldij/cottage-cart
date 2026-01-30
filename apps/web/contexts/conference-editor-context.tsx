'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

// =============================================
// TYPES
// =============================================

export interface ConferenceData {
  id?: string
  slug?: string
  name: string
  tagline: string
  description: string
  startDate: string
  endDate: string
  timezone: string
  venueName: string
  venueAddress: string
  logoUrl: string | null
  bannerUrl: string | null
  primaryColor: string
  secondaryColor: string
  websiteUrl: string
  isPublic: boolean
  isHybrid: boolean
  registrationOpen: boolean
  maxAttendees: number | null
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
  name: '',
  tagline: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  timezone: 'America/New_York',
  venueName: '',
  venueAddress: '',
  logoUrl: null,
  bannerUrl: null,
  primaryColor: '#2563eb',
  secondaryColor: '#8b5cf6',
  websiteUrl: '',
  isPublic: true,
  isHybrid: false,
  registrationOpen: true,
  maxAttendees: null,
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
