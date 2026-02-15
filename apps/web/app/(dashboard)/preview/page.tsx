'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

import { IphoneSimulator } from '@/components/simulator/iphone-simulator'
import { DesktopBrowser, TabletFrame } from '@/components/simulator/desktop-browser'
import { DesktopWebsitePreview } from '@/components/simulator/desktop-website-preview'
import { AttendeeAppShell, DEFAULT_TABS } from '@/components/simulator/attendee-app-shell'
import { AttendeeAppHome } from '@/components/simulator/attendee-app-home'
import {
  AgendaScreen,
  SpeakersScreen,
  MapScreen,
  ProfileScreen,
} from '@/components/simulator/attendee-app-screens'
import {
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  Layers,
  Settings,
  Sparkles,
  RotateCcw,
  Share2,
  Zap,
  Sun,
  Moon,
  Loader2,
  Eye,
  ExternalLink,
} from 'lucide-react'

type DeviceType = 'iphone' | 'ipad' | 'desktop'
type ThemeMode = 'light' | 'dark'
type TabId = 'home' | 'agenda' | 'speakers' | 'map' | 'profile'

interface Conference {
  id: string
  name: string
  slug?: string
  tagline?: string
  start_date?: string
  end_date?: string
  venue_name?: string
  primary_color?: string
  secondary_color?: string
  font_heading?: string
  font_body?: string
  logo_url?: string | null
  banner_url?: string | null
}

interface NavigationModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  order: number
}

const DEFAULT_MODULES: NavigationModule[] = [
  { id: 'agenda', name: 'Agenda', icon: 'calendar', enabled: true, order: 1 },
  { id: 'speakers', name: 'Speakers', icon: 'users', enabled: true, order: 2 },
  { id: 'sponsors', name: 'Sponsors', icon: 'building', enabled: true, order: 3 },
  { id: 'map', name: 'Venue Map', icon: 'map', enabled: true, order: 4 },
  { id: 'networking', name: 'Networking', icon: 'message-circle', enabled: true, order: 5 },
  { id: 'polls', name: 'Live Polls', icon: 'bar-chart', enabled: true, order: 6 },
]

export default function PreviewPage() {
  const [device, setDevice] = useState<DeviceType>('iphone')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [activePanel, setActivePanel] = useState<'design' | 'content' | 'settings'>('design')
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [conference, setConference] = useState<Conference | null>(null)
  const [designTokens, setDesignTokens] = useState<any | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const conferenceId = searchParams.get('conferenceId')

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = getSupabaseBrowser()

        // Load conference directly - no auth required
        const query = supabase.from('conferences').select('*')

        const { data: conferences, error: confError } = conferenceId
          ? await query.eq('id', conferenceId).limit(1)
          : await query.order('created_at', { ascending: false }).limit(1)

        if (confError) {
          setLoadError(confError.message)
          return
        }

        if (conferences && conferences.length > 0) {
          const activeConference = conferences[0] as any
          setConference(activeConference)

          const { data: tokenRow } = await supabase
            .from('design_tokens')
            .select('tokens')
            .eq('conference_id', activeConference.id)
            .eq('is_active', true)
            .maybeSingle()

          if ((tokenRow as any)?.tokens) {
            setDesignTokens((tokenRow as any).tokens)
          } else {
            // Fallback for older rows where active flag may not be set correctly.
            const { data: latestTokenRows } = await supabase
              .from('design_tokens')
              .select('tokens')
              .eq('conference_id', activeConference.id)
              .order('created_at', { ascending: false })
              .limit(1)

            setDesignTokens((latestTokenRows as any)?.[0]?.tokens ?? null)
          }
        }
      } catch (error) {
        console.error('Error loading preview data:', error)
        setLoadError('Failed to load preview data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [conferenceId])

  const handleDeviceChange = (newDevice: DeviceType) => {
    if (newDevice !== device) {
      setIsAnimating(true)
      setTimeout(() => {
        setDevice(newDevice)
        setIsAnimating(false)
      }, 150)
    }
  }

  const tokenColors = designTokens?.colors || {}
  const tokenFonts = designTokens?.typography?.fontFamily || {}
  const appTokens = designTokens?.app || {}

  const primaryColor = tokenColors.primary || conference?.primary_color || '#6366f1'
  const secondaryColor = tokenColors.secondary || conference?.secondary_color || '#8b5cf6'
  const accentColor = tokenColors.accent || '#f59e0b'
  const backgroundColor = tokenColors.background || '#ffffff'
  const surfaceColor = tokenColors.surface || '#f8fafc'
  const textColor = tokenColors.text || '#0f172a'
  const headingColor = tokenColors.heading || (conference as any)?.heading_color || undefined
  const textMutedColor = tokenColors.textMuted || '#64748b'
  const borderColor = tokenColors.border || '#e2e8f0'
  const fontHeading = tokenFonts.heading || conference?.font_heading
  const fontBody = tokenFonts.body || conference?.font_body
  const cardStyle = appTokens.cardStyle || {
    variant: 'white',
    border: 'primary',
    iconStyle: 'solid',
  }
  const iconTheme = appTokens.iconTheme || 'solid'
  const appButtonStyle = appTokens.appButtonStyle || 'solid'
  const appButtonColor = appTokens.appButtonColor || primaryColor
  const appButtonTextColor = appTokens.appButtonTextColor || '#ffffff'
  const appTileSize = appTokens.appTileSize || 'md'
  const appTileColumns = appTokens.appTileColumns || 3
  const appTileLayout = appTokens.appTileLayout || 'grid'
  const appTileGap = appTokens.appTileGap ?? 8
  const appModules = (appTokens.modules as NavigationModule[]) || DEFAULT_MODULES
  const appBackground = {
    pattern: appTokens.backgroundPattern || null,
    patternColor: appTokens.backgroundPatternColor || null,
    gradientStart: appTokens.backgroundGradientStart || null,
    gradientEnd: appTokens.backgroundGradientEnd || null,
    imageUrl: appTokens.backgroundImageUrl || null,
    imageOverlay: appTokens.backgroundImageOverlay ?? 0.5,
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Preview...</p>
        </div>
      </div>
    )
  }

  if (!conference) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <Eye className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Conference Found</h2>
        <p className="text-muted-foreground max-w-md text-center">
          {loadError
            ? `Error: ${loadError}`
            : 'No conferences found. Create one first to preview it.'}
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <a href="/conferences/new">Create Conference</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/conferences">View All Conferences</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Left Sidebar - Design Controls */}
      <aside className="w-72 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">App Preview</h2>
              <p className="text-xs text-slate-500">See how your app looks</p>
            </div>
          </div>
        </div>

        {/* Panel Tabs */}
        <div className="flex border-b border-slate-200/60">
          {[
            { id: 'design', icon: Palette, label: 'Design' },
            { id: 'content', icon: Layers, label: 'Content' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id as typeof activePanel)}
              className={`flex-1 py-3 px-2 text-xs font-medium transition-all relative ${
                activePanel === tab.id
                  ? 'text-violet-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </div>
              {activePanel === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <AnimatePresence mode="wait">
            {activePanel === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Theme Toggle */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-2 block">Theme Mode</label>
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        theme === 'light'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        theme === 'dark'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Current Colors */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-2 block">Brand Colors</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div
                        className="h-10 w-full rounded-lg mb-2"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="text-[11px] text-slate-500 font-medium">Primary</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div
                        className="h-10 w-full rounded-lg mb-2"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <span className="text-[11px] text-slate-500 font-medium">Secondary</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                    <a href={`/conferences/${conference.id}/edit`}>Edit Branding</a>
                  </Button>
                </div>
              </motion.div>
            )}

            {activePanel === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Conference</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{conference.name}</p>
                  {conference.tagline && (
                    <p className="text-xs text-slate-500 mt-1">{conference.tagline}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Modules</span>
                    <span className="text-xs text-slate-500">
                      {appModules.filter(m => m.enabled).length} active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {appModules.filter(m => m.enabled).map(m => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor,
                        }}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={`/conferences/${conference.id}/edit`}>
                    <Layers className="h-4 w-4 mr-2" />
                    Edit Modules
                  </a>
                </Button>
              </motion.div>
            )}

            {activePanel === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Conference Name</label>
                  <input
                    type="text"
                    value={conference.name}
                    readOnly
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Public URL</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white truncate">
                      /c/{conference.slug || 'your-conference'}
                    </code>
                    <Button variant="ghost" size="icon" className="shrink-0" asChild>
                      <a href={`/c/${conference.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 space-y-2">
          <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25" asChild>
            <a href={`/c/${conference.slug}`} target="_blank">
              <Zap className="h-4 w-4 mr-2" />
              View Live Site
            </a>
          </Button>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl flex items-center justify-between px-6">
          {/* Device Selector */}
          <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
            {[
              { id: 'iphone', icon: Smartphone, label: 'iPhone' },
              { id: 'ipad', icon: Tablet, label: 'iPad' },
              { id: 'desktop', icon: Monitor, label: 'Desktop' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => handleDeviceChange(d.id as DeviceType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  device === d.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <d.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>

          {/* Preview Title */}
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Live Preview</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700" onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isAnimating ? 0.5 : 1,
              scale: isAnimating ? 0.98 : 1
            }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              {device === 'iphone' && (
                <motion.div
                  key="iphone"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <IphoneSimulator scale={0.75}>
                    <AttendeeAppShell
                      tabs={DEFAULT_TABS}
                      activeTabId={activeTab}
                      onTabChange={(id) => setActiveTab(id as TabId)}
                      primaryColor={primaryColor}
                      scale={0.75}
                    >
                      {activeTab === 'agenda' ? (
                        <AgendaScreen
                          primaryColor={primaryColor}
                          secondaryColor={secondaryColor}
                          accentColor={accentColor}
                          backgroundColor={backgroundColor}
                          surfaceColor={surfaceColor}
                          textColor={textColor}
                          textMutedColor={textMutedColor}
                          borderColor={borderColor}
                          fontHeading={fontHeading}
                          fontBody={fontBody}
                          cardStyle={cardStyle}
                          iconTheme={iconTheme}
                          appBackground={appBackground}
                          scale={0.75}
                        />
                      ) : activeTab === 'speakers' ? (
                        <SpeakersScreen
                          primaryColor={primaryColor}
                          secondaryColor={secondaryColor}
                          accentColor={accentColor}
                          backgroundColor={backgroundColor}
                          surfaceColor={surfaceColor}
                          textColor={textColor}
                          textMutedColor={textMutedColor}
                          borderColor={borderColor}
                          fontHeading={fontHeading}
                          fontBody={fontBody}
                          cardStyle={cardStyle}
                          iconTheme={iconTheme}
                          appBackground={appBackground}
                          scale={0.75}
                        />
                      ) : activeTab === 'map' ? (
                        <MapScreen
                          primaryColor={primaryColor}
                          secondaryColor={secondaryColor}
                          accentColor={accentColor}
                          backgroundColor={backgroundColor}
                          surfaceColor={surfaceColor}
                          textColor={textColor}
                          textMutedColor={textMutedColor}
                          borderColor={borderColor}
                          fontHeading={fontHeading}
                          fontBody={fontBody}
                          cardStyle={cardStyle}
                          iconTheme={iconTheme}
                          appBackground={appBackground}
                          scale={0.75}
                        />
                      ) : activeTab === 'profile' ? (
                        <ProfileScreen
                          primaryColor={primaryColor}
                          secondaryColor={secondaryColor}
                          accentColor={accentColor}
                          backgroundColor={backgroundColor}
                          surfaceColor={surfaceColor}
                          textColor={textColor}
                          textMutedColor={textMutedColor}
                          borderColor={borderColor}
                          fontHeading={fontHeading}
                          fontBody={fontBody}
                          cardStyle={cardStyle}
                          iconTheme={iconTheme}
                          appBackground={appBackground}
                          scale={0.75}
                        />
                      ) : (
                        <AttendeeAppHome
                          eventName={conference.name}
                          tagline={conference.tagline}
                          startDate={conference.start_date}
                          endDate={conference.end_date}
                          venueName={conference.venue_name}
                          bannerUrl={conference.banner_url}
                          logoUrl={conference.logo_url}
                          primaryColor={primaryColor}
                          secondaryColor={secondaryColor}
                          accentColor={accentColor}
                          backgroundColor={backgroundColor}
                          surfaceColor={surfaceColor}
                          textColor={textColor}
                          textMutedColor={textMutedColor}
                          borderColor={borderColor}
                          fontHeading={fontHeading}
                          fontBody={fontBody}
                          cardStyle={cardStyle}
                          iconTheme={iconTheme}
                          appButtonStyle={appButtonStyle}
                          appButtonColor={appButtonColor}
                          appButtonTextColor={appButtonTextColor}
                          appTileSize={appTileSize}
                          appTileColumns={appTileColumns}
                          appTileLayout={appTileLayout}
                          appTileGap={appTileGap}
                          appBackground={appBackground}
                          modules={appModules}
                          onModuleTap={(moduleId) => {
                            const moduleToTab: Record<string, TabId> = {
                              agenda: 'agenda',
                              schedule: 'agenda',
                              speakers: 'speakers',
                              map: 'map',
                              profile: 'profile',
                            }
                            const target = moduleToTab[moduleId]
                            if (target) setActiveTab(target)
                          }}
                          scale={0.75}
                        />
                      )}
                    </AttendeeAppShell>
                  </IphoneSimulator>
                </motion.div>
              )}

              {device === 'ipad' && (
                <motion.div
                  key="ipad"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabletFrame scale={0.45}>
                    <DesktopWebsitePreview
                      eventName={conference.name}
                      tagline={conference.tagline}
                      startDate={conference.start_date}
                      endDate={conference.end_date}
                      venueName={conference.venue_name}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      accentColor={accentColor}
                      backgroundColor={backgroundColor}
                      textColor={textColor}
                      headingColor={headingColor}
                      navBackgroundColor={(conference as any).nav_background_color || undefined}
                      navTextColor={(conference as any).nav_text_color || undefined}
                      buttonColor={(conference as any).button_color || undefined}
                      buttonTextColor={(conference as any).button_text_color || undefined}
                      registrationButtonText={(conference as any).registration_button_text || undefined}
                      fontHeading={fontHeading}
                      fontBody={fontBody}
                      heroStyle={(conference as any).hero_style || undefined}
                      heroHeight={(conference as any).hero_height || undefined}
                      heroBackgroundUrl={(conference as any).hero_background_url || undefined}
                      heroVideoUrl={(conference as any).hero_video_url || undefined}
                      heroOverlayOpacity={(conference as any).hero_overlay_opacity ?? undefined}
                      backgroundPattern={(conference as any).background_pattern || undefined}
                      backgroundPatternColor={(conference as any).background_pattern_color || undefined}
                      backgroundGradientStart={(conference as any).background_gradient_start || undefined}
                      backgroundGradientEnd={(conference as any).background_gradient_end || undefined}
                      backgroundImageUrl={(conference as any).background_image_url || undefined}
                      backgroundImageOverlay={(conference as any).background_image_overlay ?? undefined}
                      bannerUrl={conference.banner_url}
                      logoUrl={conference.logo_url}
                    />
                  </TabletFrame>
                </motion.div>
              )}

              {device === 'desktop' && (
                <motion.div
                  key="desktop"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <DesktopBrowser
                    url={`${conference.slug || conference.name.toLowerCase().replace(/\s+/g, '-')}.confapp.io`}
                    scale={0.55}
                  >
                    <DesktopWebsitePreview
                      eventName={conference.name}
                      tagline={conference.tagline}
                      startDate={conference.start_date}
                      endDate={conference.end_date}
                      venueName={conference.venue_name}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      accentColor={accentColor}
                      backgroundColor={backgroundColor}
                      textColor={textColor}
                      headingColor={headingColor}
                      navBackgroundColor={(conference as any).nav_background_color || undefined}
                      navTextColor={(conference as any).nav_text_color || undefined}
                      buttonColor={(conference as any).button_color || undefined}
                      buttonTextColor={(conference as any).button_text_color || undefined}
                      registrationButtonText={(conference as any).registration_button_text || undefined}
                      fontHeading={fontHeading}
                      fontBody={fontBody}
                      heroStyle={(conference as any).hero_style || undefined}
                      heroHeight={(conference as any).hero_height || undefined}
                      heroBackgroundUrl={(conference as any).hero_background_url || undefined}
                      heroVideoUrl={(conference as any).hero_video_url || undefined}
                      heroOverlayOpacity={(conference as any).hero_overlay_opacity ?? undefined}
                      backgroundPattern={(conference as any).background_pattern || undefined}
                      backgroundPatternColor={(conference as any).background_pattern_color || undefined}
                      backgroundGradientStart={(conference as any).background_gradient_start || undefined}
                      backgroundGradientEnd={(conference as any).background_gradient_end || undefined}
                      backgroundImageUrl={(conference as any).background_image_url || undefined}
                      backgroundImageOverlay={(conference as any).background_image_overlay ?? undefined}
                      bannerUrl={conference.banner_url}
                      logoUrl={conference.logo_url}
                    />
                  </DesktopBrowser>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-10 border-t border-slate-200/60 bg-white/60 backdrop-blur-xl flex items-center justify-between px-6 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              {device === 'iphone' && '393 × 852px (iPhone 15 Pro)'}
              {device === 'ipad' && '834 × 1194px (iPad Pro 11")'}
              {device === 'desktop' && '1280 × 800px (Desktop)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Preview synced</span>
          </div>
        </div>
      </main>
    </div>
  )
}
