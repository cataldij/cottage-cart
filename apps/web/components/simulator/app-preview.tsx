'use client'

import { useState } from 'react'
import { Smartphone, Monitor, RotateCcw } from 'lucide-react'
import { ios } from '@conference-os/attendee-ui'
import { IphoneSimulator } from './iphone-simulator'
import { DesktopBrowser } from './desktop-browser'
import { DesktopWebsitePreview } from './desktop-website-preview'
import { AttendeeAppShell, DEFAULT_TABS } from './attendee-app-shell'
import { AttendeeAppHome } from './attendee-app-home'

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
type TabId = 'home' | 'agenda' | 'speakers' | 'map' | 'profile'

export function AppPreview({ config, className = '' }: AppPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('iphone')
  const [activeTab, setActiveTab] = useState<TabId>('home')

  const scale = 0.7

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Live App Preview
          </h3>
          <p className="text-xs text-slate-500">
            Real attendee UI
          </p>
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              device === 'iphone'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setDevice('iphone')}
          >
            <Smartphone className="h-3.5 w-3.5" />
            iPhone
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              device === 'desktop'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="h-3.5 w-3.5" />
            Web
          </button>
        </div>
      </div>

      {/* Preview container */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Device preview */}
        <div className="relative flex h-full items-center justify-center">
          {device === 'iphone' ? (
            <IphoneSimulator scale={scale}>
              <AttendeeAppShell
                tabs={DEFAULT_TABS}
                activeTabId={activeTab}
                onTabChange={(id) => setActiveTab(id as TabId)}
                primaryColor={config.colors.primary}
                scale={scale}
              >
                <AttendeeAppHome
                  eventName={config.eventName}
                  tagline={config.tagline}
                  startDate={config.startDate}
                  endDate={config.endDate}
                  venueName={config.venueName}
                  bannerUrl={config.bannerUrl}
                  logoUrl={config.logoUrl}
                  primaryColor={config.colors.primary}
                  modules={config.modules}
                  onModuleTap={(moduleId) => console.log('Module tapped:', moduleId)}
                  scale={scale}
                />
              </AttendeeAppShell>
            </IphoneSimulator>
          ) : (
            <DesktopBrowser
              url={`${config.eventName.toLowerCase().replace(/\s+/g, '-')}.confapp.io`}
              scale={0.35}
            >
              <DesktopWebsitePreview
                eventName={config.eventName}
                tagline={config.tagline}
                startDate={config.startDate}
                endDate={config.endDate}
                venueName={config.venueName}
                primaryColor={config.colors.primary}
                secondaryColor={config.colors.secondary}
                accentColor={config.colors.accent}
                backgroundColor={config.colors.background}
                textColor={config.colors.text}
                navBackgroundColor={config.colors.navBackground}
                navTextColor={config.colors.navText}
                buttonColor={config.colors.button}
                buttonTextColor={config.colors.buttonText}
                bannerUrl={config.bannerUrl}
                logoUrl={config.logoUrl}
                fontHeading={config.fonts?.heading}
                fontBody={config.fonts?.body}
                heroHeight={config.hero?.height}
                heroOverlayOpacity={config.hero?.overlayOpacity}
              />
            </DesktopBrowser>
          )}
        </div>

        {/* Refresh hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] text-slate-500 shadow-sm backdrop-blur-sm">
          <RotateCcw className="h-3 w-3" />
          Auto-sync
        </div>
      </div>
    </div>
  )
}
