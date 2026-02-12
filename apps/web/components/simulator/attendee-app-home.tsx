'use client'

import { ChevronRight } from 'lucide-react'
import {
  ios,
  CompactHeroCard,
  CompactModuleGrid,
} from '@conference-os/attendee-ui'

interface NavigationModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  order: number
}

interface AttendeeAppHomeProps {
  eventName: string
  tagline?: string
  startDate?: string
  endDate?: string
  venueName?: string
  bannerUrl?: string | null
  logoUrl?: string | null
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  backgroundColor?: string
  surfaceColor?: string
  textColor?: string
  textMutedColor?: string
  borderColor?: string
  fontHeading?: string
  fontBody?: string
  cardStyle?: {
    variant?: 'white' | 'tinted' | 'glass'
    border?: 'none' | 'primary' | 'secondary' | 'accent'
    iconStyle?: 'solid' | 'outline' | 'pill'
  }
  iconTheme?: 'solid' | 'outline' | 'duotone' | 'glass'
  appBackground?: {
    pattern?: string | null
    patternColor?: string | null
    gradientStart?: string | null
    gradientEnd?: string | null
    imageUrl?: string | null
    imageOverlay?: number
  }
  modules: NavigationModule[]
  onModuleTap?: (moduleId: string) => void
  scale?: number
}

/**
 * Home screen for the attendee app
 * Uses shared components from @conference-os/attendee-ui
 */
export function AttendeeAppHome({
  eventName,
  tagline,
  startDate,
  endDate,
  venueName,
  bannerUrl,
  logoUrl,
  primaryColor = ios.colors.systemBlue,
  secondaryColor = ios.colors.systemIndigo,
  accentColor = ios.colors.systemTeal,
  backgroundColor = ios.colors.secondarySystemBackground,
  surfaceColor = ios.colors.systemBackground,
  textColor = ios.colors.label,
  textMutedColor = ios.colors.secondaryLabel,
  borderColor = ios.colors.separator,
  fontHeading,
  fontBody,
  cardStyle = {
    variant: 'white',
    border: 'primary',
    iconStyle: 'solid',
  },
  iconTheme = 'solid',
  appBackground,
  modules,
  onModuleTap,
  scale = 0.7,
}: AttendeeAppHomeProps) {
  // Map module IDs to the shared module config IDs
  const moduleIdMap: Record<string, string> = {
    schedule: 'agenda',
    agenda: 'agenda',
    speakers: 'speakers',
    exhibitors: 'sponsors',
    sponsors: 'sponsors',
    maps: 'map',
    map: 'map',
    networking: 'networking',
    chat: 'networking',
    announcements: 'announcements',
    notifications: 'announcements',
  }

  const enabledModules = modules
    .filter(m => m.enabled)
    .sort((a, b) => a.order - b.order)
    .map(m => moduleIdMap[m.id] || m.id)
    .filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
    .slice(0, 6)

  const backgroundStyle: React.CSSProperties = {
    backgroundColor,
  }

  if (appBackground?.gradientStart && appBackground?.gradientEnd) {
    backgroundStyle.backgroundImage = `linear-gradient(180deg, ${appBackground.gradientStart}, ${appBackground.gradientEnd})`
  }

  const patternCSS = appBackground?.pattern
    ? getPatternCSS(appBackground.pattern, appBackground.patternColor || 'rgba(0,0,0,0.05)')
    : undefined

  return (
    <div
      className="relative flex h-full flex-col"
      style={{
        ...backgroundStyle,
        fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {patternCSS && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: patternCSS,
            backgroundSize: '20px 20px',
          }}
        />
      )}
      {appBackground?.imageUrl && (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${appBackground.imageUrl})` }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: `rgba(255, 255, 255, ${appBackground.imageOverlay ?? 0.5})` }}
          />
        </>
      )}
      {/* iOS-style overscroll bounce */}
      <div
        className="relative z-10 flex-1 overflow-y-auto overscroll-y-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Hero Section */}
        <div style={{ padding: 12 * scale, paddingTop: 8 * scale }}>
          <CompactHeroCard
            name={eventName}
            tagline={tagline}
            bannerUrl={bannerUrl}
            logoUrl={logoUrl}
            startDate={startDate}
            endDate={endDate}
            venueName={venueName}
            primaryColor={primaryColor}
            scale={scale}
          />
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: `0 ${12 * scale}px ${16 * scale}px`,
          }}
        >
          {/* Next Up Card */}
          <SectionHeader
            label="Next Up"
            scale={scale}
            textMutedColor={textMutedColor}
            fontBody={fontBody}
          />
          <NextUpCard
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
            scale={scale}
            backgroundColor={surfaceColor}
            textColor={textColor}
            textMutedColor={textMutedColor}
            borderColor={borderColor}
            fontHeading={fontHeading}
            fontBody={fontBody}
            cardStyle={cardStyle}
          />

          {/* Module Grid */}
          <SectionHeader
            label="Explore"
            scale={scale}
            style={{ marginTop: 16 * scale }}
            textMutedColor={textMutedColor}
            fontBody={fontBody}
          />
          <CompactModuleGrid
            modules={enabledModules}
            onModulePress={onModuleTap}
            columns={3}
            scale={scale * 0.85}
            gap={8}
            iconStyle={iconTheme}
          />

          {/* Quick Stats */}
          <SectionHeader
            label="At a Glance"
            scale={scale}
            style={{ marginTop: 16 * scale }}
            textMutedColor={textMutedColor}
            fontBody={fontBody}
          />
          <QuickStatsCard
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
            scale={scale}
            backgroundColor={surfaceColor}
            textColor={textColor}
            textMutedColor={textMutedColor}
            borderColor={borderColor}
            fontHeading={fontHeading}
            fontBody={fontBody}
            cardStyle={cardStyle}
          />
        </div>
      </div>
    </div>
  )
}

function getPatternCSS(pattern: string, color: string): string | undefined {
  switch (pattern) {
    case 'dots':
      return `radial-gradient(circle at 1px 1px, ${color} 1px, transparent 0)`
    case 'grid':
      return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`
    case 'diagonal':
      return `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 10px)`
    case 'zigzag':
      return `linear-gradient(135deg, ${color} 25%, transparent 25%), linear-gradient(225deg, ${color} 25%, transparent 25%), linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(315deg, ${color} 25%, transparent 25%)`
    case 'waves':
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.03\' d=\'M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")'
    case 'hexagons':
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    case 'circuit':
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 304 304\' width=\'304\' height=\'304\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.02\' d=\'M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V0h-28.1z\'%3E%3C/path%3E%3C/svg%3E")'
    case 'topography':
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'600\' viewBox=\'0 0 600 600\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.03\' d=\'M600 325.1c-3.5-3.2-6.4-7.1-8.5-11.5-1.5-3.2-2.5-6.6-2.9-10.1-.6-5.4 0-10.9 1.7-16.1 3.6-11.3 12.4-21 24.4-25.3v-2.1c-13.1 4.4-22.7 14.9-26.5 27.3-1.9 6.1-2.4 12.4-1.6 18.6.5 4.2 1.7 8.3 3.5 12.1 2.5 5.2 6 9.9 10.3 13.7 4.9 4.4 10.6 7.9 16.7 10.3v-2.3c-5.7-2.4-10.9-5.7-15.4-9.9-1-.9-1.8-1.8-2.7-2.8zM0 325.1c3.5-3.2 6.4-7.1 8.5-11.5 1.5-3.2 2.5-6.6 2.9-10.1.6-5.4 0-10.9-1.7-16.1-3.6-11.3-12.4-21-24.4-25.3v-2.1c13.1 4.4 22.7 14.9 26.5 27.3 1.9 6.1 2.4 12.4 1.6 18.6-.5 4.2-1.7 8.3-3.5 12.1-2.5 5.2-6 9.9-10.3 13.7-4.9 4.4-10.6 7.9-16.7 10.3v-2.3c5.7-2.4 10.9-5.7 15.4-9.9-1-.9-1.8-1.8-2.7-2.8z\'/%3E%3C/svg%3E")'
    case 'waves':
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.03\' d=\'M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")'
    case 'hexagons':
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    case 'circuit':
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 304 304\' width=\'304\' height=\'304\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.02\' d=\'M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V0h-28.1z\'%3E%3C/path%3E%3C/svg%3E")'
    case 'topography':
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'600\' viewBox=\'0 0 600 600\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.03\' d=\'M600 325.1c-3.5-3.2-6.4-7.1-8.5-11.5-1.5-3.2-2.5-6.6-2.9-10.1-.6-5.4 0-10.9 1.7-16.1 3.6-11.3 12.4-21 24.4-25.3v-2.1c-13.1 4.4-22.7 14.9-26.5 27.3-1.9 6.1-2.4 12.4-1.6 18.6.5 4.2 1.7 8.3 3.5 12.1 2.5 5.2 6 9.9 10.3 13.7 4.9 4.4 10.6 7.9 16.7 10.3v-2.3c-5.7-2.4-10.9-5.7-15.4-9.9-1-.9-1.8-1.8-2.7-2.8zM0 325.1c3.5-3.2 6.4-7.1 8.5-11.5 1.5-3.2 2.5-6.6 2.9-10.1.6-5.4 0-10.9-1.7-16.1-3.6-11.3-12.4-21-24.4-25.3v-2.1c13.1 4.4 22.7 14.9 26.5 27.3 1.9 6.1 2.4 12.4 1.6 18.6-.5 4.2-1.7 8.3-3.5 12.1-2.5 5.2-6 9.9-10.3 13.7-4.9 4.4-10.6 7.9-16.7 10.3v-2.3c5.7-2.4 10.9-5.7 15.4-9.9-1-.9-1.8-1.8-2.7-2.8z\'/%3E%3C/svg%3E")'
    default:
      return undefined
  }
}

// Section Header Component
function SectionHeader({
  label,
  scale = 0.7,
  textMutedColor = ios.colors.secondaryLabel,
  fontBody,
  style,
}: {
  label: string
  scale?: number
  textMutedColor?: string
  fontBody?: string
  style?: React.CSSProperties
}) {
  return (
    <p
      style={{
        fontSize: 11 * scale,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5 * scale,
        color: textMutedColor,
        marginBottom: 8 * scale,
        fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        ...style,
      }}
    >
      {label}
    </p>
  )
}

// Next Up Card Component
function NextUpCard({
  primaryColor,
  secondaryColor,
  accentColor,
  scale = 0.7,
  backgroundColor = ios.colors.systemBackground,
  textColor = ios.colors.label,
  textMutedColor = ios.colors.secondaryLabel,
  borderColor = ios.colors.separator,
  fontHeading,
  fontBody,
  cardStyle = {
    variant: 'white',
    border: 'primary',
    iconStyle: 'solid',
  },
}: {
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  scale?: number
  backgroundColor?: string
  textColor?: string
  textMutedColor?: string
  borderColor?: string
  fontHeading?: string
  fontBody?: string
  cardStyle?: {
    variant?: 'white' | 'tinted' | 'glass'
    border?: 'none' | 'primary' | 'secondary' | 'accent'
    iconStyle?: 'solid' | 'outline' | 'pill'
  }
}) {
  const resolvedBorderColor = cardStyle?.border === 'none'
    ? 'transparent'
    : cardStyle?.border === 'secondary'
      ? (secondaryColor || borderColor)
      : cardStyle?.border === 'accent'
        ? (accentColor || primaryColor)
        : primaryColor

  const cardBackground = cardStyle?.variant === 'glass'
    ? 'rgba(255, 255, 255, 0.65)'
    : cardStyle?.variant === 'white'
      ? '#ffffff'
      : (backgroundColor || ios.colors.systemBackground)

  const iconStyle = cardStyle?.iconStyle || 'solid'
  const iconBackground = iconStyle === 'solid'
    ? primaryColor
    : iconStyle === 'pill'
      ? primaryColor
      : 'transparent'
  const iconBorder = iconStyle === 'outline' ? `1px solid ${resolvedBorderColor}` : 'none'
  const iconColor = iconStyle === 'outline' ? resolvedBorderColor : '#ffffff'

  return (
    <div
      style={{
        backgroundColor: cardBackground,
        borderRadius: ios.radius.lg * scale,
        padding: 12 * scale,
        boxShadow: ios.shadow.card,
        border: `1px solid ${resolvedBorderColor}`,
        backdropFilter: cardStyle?.variant === 'glass' ? 'blur(12px)' : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 9 * scale,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3 * scale,
              color: primaryColor,
              fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            9:00 AM - Main Stage
          </p>
          <p
            style={{
              fontSize: 13 * scale,
              fontWeight: 600,
              color: textColor,
              marginTop: 2 * scale,
              fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            Opening Keynote
          </p>
          <p
            style={{
              fontSize: 11 * scale,
              color: textMutedColor,
              marginTop: 1 * scale,
              fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            Dr. Sarah Chen
          </p>
        </div>
        <div
          style={{
            width: 32 * scale,
            height: 32 * scale,
            borderRadius: iconStyle === 'pill' ? 999 : 16 * scale,
            backgroundColor: iconBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: iconBorder,
          }}
        >
          <ChevronRight
            size={16 * scale}
            color={iconColor}
            strokeWidth={2.5}
          />
        </div>
      </div>
    </div>
  )
}

// Quick Stats Card Component
function QuickStatsCard({
  primaryColor,
  secondaryColor,
  accentColor,
  scale = 0.7,
  backgroundColor = ios.colors.systemBackground,
  textColor = ios.colors.label,
  textMutedColor = ios.colors.secondaryLabel,
  borderColor = ios.colors.separator,
  fontHeading,
  fontBody,
  cardStyle = {
    variant: 'white',
    border: 'primary',
    iconStyle: 'solid',
  },
}: {
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  scale?: number
  backgroundColor?: string
  textColor?: string
  textMutedColor?: string
  borderColor?: string
  fontHeading?: string
  fontBody?: string
  cardStyle?: {
    variant?: 'white' | 'tinted' | 'glass'
    border?: 'none' | 'primary' | 'secondary' | 'accent'
    iconStyle?: 'solid' | 'outline' | 'pill'
  }
}) {
  const resolvedBorderColor = cardStyle?.border === 'none'
    ? 'transparent'
    : cardStyle?.border === 'secondary'
      ? (secondaryColor || borderColor)
      : cardStyle?.border === 'accent'
        ? (accentColor || primaryColor)
        : primaryColor

  const cardBackground = cardStyle?.variant === 'glass'
    ? 'rgba(255, 255, 255, 0.65)'
    : cardStyle?.variant === 'white'
      ? '#ffffff'
      : (backgroundColor || ios.colors.systemBackground)

  const iconStyle = cardStyle?.iconStyle || 'solid'
  const iconBackground = iconStyle === 'solid'
    ? primaryColor
    : iconStyle === 'pill'
      ? primaryColor
      : 'transparent'
  const iconBorder = iconStyle === 'outline' ? `1px solid ${resolvedBorderColor}` : 'none'
  const iconColor = iconStyle === 'outline' ? resolvedBorderColor : '#ffffff'

  const stats = [
    { label: 'Sessions', value: '48', icon: 'S' },
    { label: 'Speakers', value: '24', icon: 'SP' },
    { label: 'Attendees', value: '500+', icon: 'AT' },
  ]

  return (
    <div
      style={{
        backgroundColor: cardBackground,
        borderRadius: ios.radius.lg * scale,
        overflow: 'hidden',
        boxShadow: ios.shadow.card,
        border: `1px solid ${resolvedBorderColor}`,
        backdropFilter: cardStyle?.variant === 'glass' ? 'blur(12px)' : undefined,
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${10 * scale}px ${12 * scale}px`,
            borderBottom: index < stats.length - 1
              ? `0.5px solid ${borderColor || ios.colors.separator}`
              : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 * scale }}>
            <div
              style={{
                width: 22 * scale,
                height: 22 * scale,
                borderRadius: iconStyle === 'pill' ? 999 : 6 * scale,
                backgroundColor: iconBackground,
                border: iconBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9 * scale,
                fontWeight: 700,
                color: iconColor,
                textTransform: 'uppercase',
              }}
            >
              {stat.icon}
            </div>
            <span
              style={{
                fontSize: 12 * scale,
                color: textColor,
                fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              {stat.label}
            </span>
          </div>
          <span
            style={{
              fontSize: 12 * scale,
              fontWeight: 600,
              color: primaryColor,
              fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}
