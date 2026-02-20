'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Monitor, RotateCcw, Expand, X } from 'lucide-react'
import { IphoneSimulator } from './iphone-simulator'
import { DesktopBrowser } from './desktop-browser'
import { DesktopWebsitePreview } from './desktop-website-preview'
import { AttendeeAppShell, DEFAULT_TABS } from './attendee-app-shell'
import { AttendeeAppHome } from './attendee-app-home'
import {
  CatalogScreen,
  OrdersScreen,
  PickupScreen,
  AccountScreen,
} from './attendee-app-screens'

// Google Fonts loader - comprehensive font map
const FONT_MAP: Record<string, string> = {
  // Modern Sans
  'Inter': 'Inter:wght@400;500;600;700',
  'Poppins': 'Poppins:wght@400;500;600;700',
  'DM Sans': 'DM+Sans:wght@400;500;600;700',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@400;500;600;700',
  'Manrope': 'Manrope:wght@400;500;600;700',
  'Outfit': 'Outfit:wght@400;500;600;700',
  'Figtree': 'Figtree:wght@400;500;600;700',
  'Albert Sans': 'Albert+Sans:wght@400;500;600;700',
  // Classic Sans
  'Roboto': 'Roboto:wght@400;500;700',
  'Open Sans': 'Open+Sans:wght@400;500;600;700',
  'Lato': 'Lato:wght@400;700',
  'Montserrat': 'Montserrat:wght@400;500;600;700',
  'Raleway': 'Raleway:wght@400;500;600;700',
  'Nunito': 'Nunito:wght@400;500;600;700',
  'Source Sans 3': 'Source+Sans+3:wght@400;500;600;700',
  'Work Sans': 'Work+Sans:wght@400;500;600;700',
  'Rubik': 'Rubik:wght@400;500;600;700',
  'Quicksand': 'Quicksand:wght@400;500;600;700',
  'Karla': 'Karla:wght@400;500;600;700',
  // Display
  'Sora': 'Sora:wght@400;500;600;700',
  'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
  'Lexend': 'Lexend:wght@400;500;600;700',
  'Urbanist': 'Urbanist:wght@400;500;600;700',
  'Red Hat Display': 'Red+Hat+Display:wght@400;500;600;700',
  'Bebas Neue': 'Bebas+Neue',
  'Oswald': 'Oswald:wght@400;500;600;700',
  'Anton': 'Anton',
  'Archivo': 'Archivo:wght@400;500;600;700',
  // Serif
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
  'Merriweather': 'Merriweather:wght@400;700',
  'Lora': 'Lora:wght@400;500;600;700',
  'Libre Baskerville': 'Libre+Baskerville:wght@400;700',
  'Cormorant Garamond': 'Cormorant+Garamond:wght@400;500;600;700',
  'Crimson Pro': 'Crimson+Pro:wght@400;500;600;700',
  'Source Serif 4': 'Source+Serif+4:wght@400;500;600;700',
  'DM Serif Display': 'DM+Serif+Display',
  // Monospace
  'JetBrains Mono': 'JetBrains+Mono:wght@400;500;600;700',
  'Fira Code': 'Fira+Code:wght@400;500;600;700',
  'Source Code Pro': 'Source+Code+Pro:wght@400;500;600;700',
  'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;500;600;700',
}

function useGoogleFonts(headingFont?: string, bodyFont?: string) {
  useEffect(() => {
    const fonts: string[] = []

    if (headingFont && FONT_MAP[headingFont]) {
      fonts.push(FONT_MAP[headingFont])
    }
    if (bodyFont && bodyFont !== headingFont && FONT_MAP[bodyFont]) {
      fonts.push(FONT_MAP[bodyFont])
    }

    if (fonts.length === 0) return

    const linkId = 'google-fonts-preview'
    let link = document.getElementById(linkId) as HTMLLinkElement | null

    const url = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}`).join('&')}&display=swap`

    if (link) {
      link.href = url
    } else {
      link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = url
      document.head.appendChild(link)
    }
  }, [headingFont, bodyFont])
}

interface NavigationModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  order: number
}

interface PreviewConfig {
  eventName: string
  tagline?: string
  startDate?: string
  endDate?: string
  venueName?: string
  bannerUrl?: string | null
  logoUrl?: string | null
  registrationButtonText?: string
  colors: {
    primary: string
    secondary?: string
    accent?: string
    background?: string
    text?: string
    heading?: string
    navBackground?: string
    navText?: string
    button?: string
    buttonText?: string
    surface?: string
    textMuted?: string
    border?: string
  }
  fonts?: {
    heading?: string
    body?: string
  }
  cardStyle?: {
    variant?: 'white' | 'tinted' | 'glass'
    border?: 'none' | 'primary' | 'secondary' | 'accent'
    iconStyle?: 'solid' | 'outline' | 'pill'
  }
  iconTheme?: 'solid' | 'outline' | 'duotone' | 'glass'
  appButtonStyle?: 'solid' | 'outline' | 'soft'
  appButtonColor?: string
  appButtonTextColor?: string
  appTileSize?: 'sm' | 'md' | 'lg' | 'xl'
  appTileColumns?: 2 | 3 | 4 | 5 | 6
  appTileLayout?: 'grid' | 'row'
  appTileGap?: number
  appBackground?: {
    pattern?: string | null
    patternColor?: string | null
    gradientStart?: string | null
    gradientEnd?: string | null
    imageUrl?: string | null
    imageOverlay?: number
  }
  hero?: {
    height?: 'small' | 'medium' | 'large' | 'full'
    style?: 'image' | 'video' | 'gradient'
    backgroundUrl?: string | null
    videoUrl?: string | null
    overlayOpacity?: number
  }
  background?: {
    pattern?: 'none' | 'dots' | 'grid' | 'diagonal' | 'zigzag'
    patternColor?: string
    gradientStart?: string
    gradientEnd?: string
    imageUrl?: string | null
    imageOverlay?: number
  }
  fontFamily?: string
  gradientHero?: string
  modules: NavigationModule[]
}

interface AppPreviewProps {
  config: PreviewConfig
  className?: string
}

type DeviceType = 'iphone' | 'desktop'
type TabId = 'home' | 'catalog' | 'orders' | 'pickup' | 'account'

export function AppPreview({ config, className = '' }: AppPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('iphone')
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [expanded, setExpanded] = useState(false)

  // Load Google Fonts for preview
  useGoogleFonts(config.fonts?.heading, config.fonts?.body)

  const scale = 0.82
  const expandedScale = device === 'iphone' ? 0.95 : 0.58

  const handleModuleTap = (moduleId: string) => {
    const moduleToTab: Record<string, TabId> = {
      catalog: 'catalog',
      orders: 'orders',
      pickup: 'pickup',
      account: 'account',
      reviews: 'orders',
      messages: 'account',
      agenda: 'catalog',
      schedule: 'catalog',
      speakers: 'orders',
      map: 'pickup',
      profile: 'account',
    }
    const target = moduleToTab[moduleId]
    if (target) setActiveTab(target)
  }

  const renderActiveAppScreen = (s: number) => {
    const sharedProps = {
      primaryColor: config.colors.primary,
      secondaryColor: config.colors.secondary,
      accentColor: config.colors.accent,
      backgroundColor: config.colors.background,
      surfaceColor: config.colors.surface,
      textColor: config.colors.text,
      textMutedColor: config.colors.textMuted,
      borderColor: config.colors.border,
      fontHeading: config.fonts?.heading,
      fontBody: config.fonts?.body,
      cardStyle: config.cardStyle,
      iconTheme: config.iconTheme,
      appButtonStyle: config.appButtonStyle,
      appButtonColor: config.appButtonColor,
      appButtonTextColor: config.appButtonTextColor,
      appTileSize: config.appTileSize,
      appTileColumns: config.appTileColumns,
      appTileLayout: config.appTileLayout,
      appTileGap: config.appTileGap,
      appBackground: config.appBackground,
      scale: s,
    }

    if (activeTab === 'catalog') return <CatalogScreen {...sharedProps} />
    if (activeTab === 'orders') return <OrdersScreen {...sharedProps} />
    if (activeTab === 'pickup') return <PickupScreen {...sharedProps} />
    if (activeTab === 'account') return <AccountScreen {...sharedProps} />

    return (
      <AttendeeAppHome
        eventName={config.eventName}
        tagline={config.tagline}
        startDate={config.startDate}
        endDate={config.endDate}
        venueName={config.venueName}
        bannerUrl={config.bannerUrl}
        logoUrl={config.logoUrl}
        primaryColor={config.colors.primary}
        secondaryColor={config.colors.secondary}
        accentColor={config.colors.accent}
        backgroundColor={config.colors.background}
        surfaceColor={config.colors.surface}
        textColor={config.colors.text}
        textMutedColor={config.colors.textMuted}
        borderColor={config.colors.border}
        fontHeading={config.fonts?.heading}
        fontBody={config.fonts?.body}
        cardStyle={config.cardStyle}
        iconTheme={config.iconTheme}
        appButtonStyle={config.appButtonStyle}
        appButtonColor={config.appButtonColor}
        appButtonTextColor={config.appButtonTextColor}
        appTileSize={config.appTileSize}
        appTileColumns={config.appTileColumns}
        appTileLayout={config.appTileLayout}
        appTileGap={config.appTileGap}
        appBackground={config.appBackground}
        modules={config.modules}
        onModuleTap={handleModuleTap}
        scale={s}
      />
    )
  }

  const desktopScale = 0.38

  const websitePreviewProps = {
    eventName: config.eventName,
    tagline: config.tagline,
    startDate: config.startDate,
    endDate: config.endDate,
    venueName: config.venueName,
    primaryColor: config.colors.primary,
    secondaryColor: config.colors.secondary,
    accentColor: config.colors.accent,
    backgroundColor: config.colors.background,
    textColor: config.colors.text,
    headingColor: config.colors.heading,
    navBackgroundColor: config.colors.navBackground,
    navTextColor: config.colors.navText,
    buttonColor: config.colors.button,
    buttonTextColor: config.colors.buttonText,
    registrationButtonText: config.registrationButtonText,
    bannerUrl: config.bannerUrl,
    logoUrl: config.logoUrl,
    fontHeading: config.fonts?.heading,
    fontBody: config.fonts?.body,
    heroStyle: config.hero?.style,
    heroHeight: config.hero?.height,
    heroBackgroundUrl: config.hero?.backgroundUrl,
    heroVideoUrl: config.hero?.videoUrl,
    heroOverlayOpacity: config.hero?.overlayOpacity,
    backgroundPattern: config.background?.pattern,
    backgroundPatternColor: config.background?.patternColor,
    backgroundGradientStart: config.background?.gradientStart,
    backgroundGradientEnd: config.background?.gradientEnd,
    backgroundImageUrl: config.background?.imageUrl,
    backgroundImageOverlay: config.background?.imageOverlay,
  }

  const shopUrl = `${config.eventName.toLowerCase().replace(/\s+/g, '-')}.makers.market`

  const renderDevice = (s: number) => (
    device === 'iphone' ? (
      <IphoneSimulator scale={s}>
        <AttendeeAppShell
          tabs={DEFAULT_TABS}
          activeTabId={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
          primaryColor={config.colors.primary}
          scale={s}
        >
          {renderActiveAppScreen(s)}
        </AttendeeAppShell>
      </IphoneSimulator>
    ) : (
      <DesktopBrowser url={shopUrl} scale={s}>
        <DesktopWebsitePreview {...websitePreviewProps} />
      </DesktopBrowser>
    )
  )

  return (
    <>
      <div className={`flex h-full flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-1 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Live Store Preview</h3>
            <p className="text-xs text-slate-500">Real customer UI</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Device toggle */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                  device === 'iphone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setDevice('iphone')}
              >
                <Smartphone className="h-3.5 w-3.5" />
                iPhone
              </button>
              <button
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                  device === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-3.5 w-3.5" />
                Web
              </button>
            </div>

            {/* Expand button */}
            <button
              onClick={() => setExpanded(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:text-amber-700"
              title="Expand preview"
            >
              <Expand className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Preview container */}
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-stone-200 p-4">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative flex h-full items-center justify-center">
            {renderDevice(device === 'iphone' ? scale : desktopScale)}
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] text-slate-500 shadow-sm backdrop-blur-sm">
            <RotateCcw className="h-3 w-3" />
            Auto-sync
          </div>
        </div>
      </div>

      {/* Fullscreen expand modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5">
                <div className="flex items-center gap-1 rounded-lg bg-white/20 p-1">
                  <button
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                      device === 'iphone' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white'
                    }`}
                    onClick={() => setDevice('iphone')}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    iPhone
                  </button>
                  <button
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                      device === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white'
                    }`}
                    onClick={() => setDevice('desktop')}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Web
                  </button>
                </div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Large preview */}
            <div className="flex items-center justify-center overflow-auto rounded-2xl">
              {renderDevice(device === 'iphone' ? expandedScale : 0.58)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
