'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

// =============================================
// TYPES
// =============================================

export interface ShopData {
  id?: string
  slug?: string
  // Basic Info
  name: string
  tagline: string
  description: string
  category: 'bakery' | 'chocolatier' | 'hot_sauce' | 'food_truck' | 'jams_preserves' | 'specialty' | 'other'
  // Location
  locationName: string
  locationAddress: string
  websiteUrl: string
  // Pickup & Delivery
  pickupInstructions: string
  deliveryAvailable: boolean
  deliveryRadius: number | null
  deliveryFee: number | null
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
  orderButtonText: string
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
  termsUrl: string
  // Social Links
  instagramUrl: string
  facebookUrl: string
  tiktokUrl: string
  // Settings
  isPublic: boolean
  acceptingOrders: boolean
  requiresPreorder: boolean
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
export type EditorStep = 'overview' | 'menu' | 'branding' | 'publish'

const STEPS: EditorStep[] = ['overview', 'menu', 'branding', 'publish']

interface EditorState {
  mode: EditorMode
  currentStep: EditorStep
  shop: ShopData
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
  updateShop: (updates: Partial<ShopData>) => void
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
  { id: 'menu', name: 'Menu', icon: 'UtensilsCrossed', enabled: true, order: 1 },
  { id: 'preorder', name: 'Pre-Order', icon: 'ShoppingBag', enabled: true, order: 2 },
  { id: 'hours', name: 'Hours & Pickup', icon: 'Clock', enabled: true, order: 3 },
  { id: 'about', name: 'About', icon: 'Heart', enabled: true, order: 4 },
  { id: 'reviews', name: 'Reviews', icon: 'Star', enabled: false, order: 5 },
]

const DEFAULT_SHOP: ShopData = {
  // Basic Info
  name: '',
  tagline: '',
  description: '',
  category: 'bakery',
  // Location
  locationName: '',
  locationAddress: '',
  websiteUrl: '',
  // Pickup & Delivery
  pickupInstructions: '',
  deliveryAvailable: false,
  deliveryRadius: null,
  deliveryFee: null,
  // Branding Assets
  logoUrl: null,
  bannerUrl: null,
  // Colors
  primaryColor: '#D97706',
  secondaryColor: '#92400E',
  accentColor: '#F59E0B',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  headingColor: '#111827',
  // Navigation Colors
  navBackgroundColor: '#ffffff',
  navTextColor: '#374151',
  // Button Colors
  buttonColor: '#D97706',
  buttonTextColor: '#ffffff',
  orderButtonText: 'Pre-Order Now',
  // App Button Styles
  appButtonStyle: 'solid',
  appButtonColor: '#D97706',
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
  termsUrl: '',
  // Social Links
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  // Settings
  isPublic: true,
  acceptingOrders: true,
  requiresPreorder: true,
  // Custom
  customCss: '',
}

// =============================================
// CONTEXT
// =============================================

const EditorContext = createContext<EditorContextValue | null>(null)

interface EditorProviderProps {
  children: ReactNode
  initialShop?: Partial<ShopData>
  initialModules?: NavigationModule[]
  mode?: EditorMode
  onSave?: (data: { shop: ShopData; modules: NavigationModule[] }) => Promise<void>
  onPublish?: (data: { shop: ShopData; modules: NavigationModule[] }) => Promise<void>
}

export function ShopEditorProvider({
  children,
  initialShop,
  initialModules,
  mode: initialMode = 'wizard',
  onSave,
  onPublish,
}: EditorProviderProps) {
  const [state, setState] = useState<EditorState>({
    mode: initialMode,
    currentStep: 'overview',
    shop: { ...DEFAULT_SHOP, ...initialShop },
    modules: initialModules || DEFAULT_MODULES,
    isDirty: false,
    isSaving: false,
    isPublished: !!initialShop?.id,
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
  const updateShop = useCallback((updates: Partial<ShopData>) => {
    setState(prev => ({
      ...prev,
      shop: { ...prev.shop, ...updates },
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
      await onSave({ shop: state.shop, modules: state.modules })
      setState(prev => ({ ...prev, isDirty: false, isSaving: false }))
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }))
      throw error
    }
  }, [onSave, state.shop, state.modules])

  const publish = useCallback(async () => {
    if (!onPublish) return
    setState(prev => ({ ...prev, isSaving: true }))
    try {
      await onPublish({ shop: state.shop, modules: state.modules })
      setState(prev => ({ ...prev, isDirty: false, isSaving: false, isPublished: true }))
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }))
      throw error
    }
  }, [onPublish, state.shop, state.modules])

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
    updateShop,
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

export function useShopEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useShopEditor must be used within a ShopEditorProvider')
  }
  return context
}
