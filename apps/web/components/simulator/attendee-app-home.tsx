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

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor,
        fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {/* iOS-style overscroll bounce */}
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain"
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
