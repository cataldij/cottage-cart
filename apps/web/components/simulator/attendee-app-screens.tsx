'use client'

import { ios } from '@conference-os/attendee-ui'
import { Calendar, MapPin, Users, User, Clock } from 'lucide-react'

interface ScreenProps {
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  backgroundColor?: string
  surfaceColor?: string
  textColor?: string
  textMutedColor?: string
  borderColor?: string
  fontHeading?: string
  fontBody?: string
  scale?: number
  cardStyle?: {
    variant?: 'white' | 'tinted' | 'glass'
    border?: 'none' | 'primary' | 'secondary' | 'accent'
    iconStyle?: 'solid' | 'outline' | 'pill'
  }
}

function resolveCardStyle({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  borderColor,
  cardStyle,
}: {
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  backgroundColor?: string
  borderColor?: string
  cardStyle?: ScreenProps['cardStyle']
}) {
  const resolvedBorderColor = cardStyle?.border === 'none'
    ? 'transparent'
    : cardStyle?.border === 'secondary'
      ? (secondaryColor || borderColor || primaryColor)
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

  return {
    resolvedBorderColor,
    cardBackground,
    iconStyle,
    iconBackground,
    iconBorder,
    iconColor,
  }
}

export function AgendaScreen({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = ios.colors.secondarySystemBackground,
  surfaceColor = ios.colors.systemBackground,
  textColor = ios.colors.label,
  textMutedColor = ios.colors.secondaryLabel,
  borderColor = ios.colors.separator,
  fontHeading,
  fontBody,
  scale = 0.7,
  cardStyle,
}: ScreenProps) {
  const { resolvedBorderColor, cardBackground } = resolveCardStyle({
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: surfaceColor,
    borderColor,
    cardStyle,
  })

  const sessions = [
    { time: '9:00 AM', title: 'Opening Keynote', room: 'Main Stage' },
    { time: '10:30 AM', title: 'Designing for Scale', room: 'Room A' },
    { time: '2:00 PM', title: 'AI in Production', room: 'Room B' },
  ]

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor }}>
      <div style={{ padding: 12 * scale }}>
        <h2
          style={{
            fontSize: 16 * scale,
            fontWeight: 700,
            color: textColor,
            fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            marginBottom: 8 * scale,
          }}
        >
          Agenda
        </h2>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.title}
              style={{
                backgroundColor: cardBackground,
                borderRadius: ios.radius.lg * scale,
                border: `1px solid ${resolvedBorderColor}`,
                padding: 12 * scale,
                boxShadow: ios.shadow.card,
              }}
            >
              <div className="flex items-center gap-2">
                <Clock size={14 * scale} color={primaryColor} />
                <span
                  style={{
                    fontSize: 11 * scale,
                    fontWeight: 600,
                    color: primaryColor,
                    fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  }}
                >
                  {session.time}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13 * scale,
                  fontWeight: 600,
                  color: textColor,
                  marginTop: 4 * scale,
                  fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
              >
                {session.title}
              </div>
              <div
                style={{
                  fontSize: 11 * scale,
                  color: textMutedColor,
                  marginTop: 2 * scale,
                  fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
              >
                {session.room}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SpeakersScreen({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = ios.colors.secondarySystemBackground,
  surfaceColor = ios.colors.systemBackground,
  textColor = ios.colors.label,
  textMutedColor = ios.colors.secondaryLabel,
  borderColor = ios.colors.separator,
  fontHeading,
  fontBody,
  scale = 0.7,
  cardStyle,
}: ScreenProps) {
  const { resolvedBorderColor, cardBackground } = resolveCardStyle({
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: surfaceColor,
    borderColor,
    cardStyle,
  })

  const speakers = [
    { name: 'Sarah Chen', title: 'VP Product, Nova' },
    { name: 'Luis Ortega', title: 'Staff Engineer, Orion' },
    { name: 'Priya Patel', title: 'Design Lead, Atlas' },
  ]

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor }}>
      <div style={{ padding: 12 * scale }}>
        <h2
          style={{
            fontSize: 16 * scale,
            fontWeight: 700,
            color: textColor,
            fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            marginBottom: 8 * scale,
          }}
        >
          Speakers
        </h2>
        <div className="space-y-2">
          {speakers.map((speaker) => (
            <div
              key={speaker.name}
              style={{
                backgroundColor: cardBackground,
                borderRadius: ios.radius.lg * scale,
                border: `1px solid ${resolvedBorderColor}`,
                padding: 12 * scale,
                boxShadow: ios.shadow.card,
                display: 'flex',
                alignItems: 'center',
                gap: 10 * scale,
              }}
            >
              <div
                style={{
                  width: 36 * scale,
                  height: 36 * scale,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor || primaryColor})`,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 12 * scale,
                    fontWeight: 600,
                    color: textColor,
                    fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  }}
                >
                  {speaker.name}
                </div>
                <div
                  style={{
                    fontSize: 10 * scale,
                    color: textMutedColor,
                    fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  }}
                >
                  {speaker.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MapScreen({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = ios.colors.secondarySystemBackground,
  surfaceColor = ios.colors.systemBackground,
  textColor = ios.colors.label,
  textMutedColor = ios.colors.secondaryLabel,
  borderColor = ios.colors.separator,
  fontHeading,
  fontBody,
  scale = 0.7,
  cardStyle,
}: ScreenProps) {
  const { resolvedBorderColor, cardBackground, iconBackground, iconBorder, iconColor, iconStyle } = resolveCardStyle({
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: surfaceColor,
    borderColor,
    cardStyle,
  })

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor }}>
      <div style={{ padding: 12 * scale }}>
        <h2
          style={{
            fontSize: 16 * scale,
            fontWeight: 700,
            color: textColor,
            fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            marginBottom: 8 * scale,
          }}
        >
          Venue Map
        </h2>
        <div
          style={{
            backgroundColor: cardBackground,
            borderRadius: ios.radius.lg * scale,
            border: `1px solid ${resolvedBorderColor}`,
            padding: 12 * scale,
            boxShadow: ios.shadow.card,
          }}
        >
          <div
            style={{
              height: 120 * scale,
              borderRadius: ios.radius.md * scale,
              background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor || primaryColor}30)`,
              border: `1px solid ${resolvedBorderColor}`,
            }}
          />
          <div className="mt-2 flex items-center gap-2">
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
              }}
            >
              <MapPin size={12 * scale} color={iconColor} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 12 * scale,
                  fontWeight: 600,
                  color: textColor,
                  fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
              >
                Main Hall
              </div>
              <div
                style={{
                  fontSize: 10 * scale,
                  color: textMutedColor,
                  fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
              >
                Moscone Center • Level 2
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileScreen({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = ios.colors.secondarySystemBackground,
  surfaceColor = ios.colors.systemBackground,
  textColor = ios.colors.label,
  textMutedColor = ios.colors.secondaryLabel,
  borderColor = ios.colors.separator,
  fontHeading,
  fontBody,
  scale = 0.7,
  cardStyle,
}: ScreenProps) {
  const { resolvedBorderColor, cardBackground, iconBackground, iconBorder, iconColor, iconStyle } = resolveCardStyle({
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: surfaceColor,
    borderColor,
    cardStyle,
  })

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor }}>
      <div style={{ padding: 12 * scale }}>
        <h2
          style={{
            fontSize: 16 * scale,
            fontWeight: 700,
            color: textColor,
            fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            marginBottom: 8 * scale,
          }}
        >
          My Profile
        </h2>
        <div
          style={{
            backgroundColor: cardBackground,
            borderRadius: ios.radius.lg * scale,
            border: `1px solid ${resolvedBorderColor}`,
            padding: 12 * scale,
            boxShadow: ios.shadow.card,
            display: 'flex',
            alignItems: 'center',
            gap: 10 * scale,
          }}
        >
          <div
            style={{
              width: 40 * scale,
              height: 40 * scale,
              borderRadius: 999,
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor || primaryColor})`,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 12 * scale,
                fontWeight: 600,
                color: textColor,
                fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              Jordan Lee
            </div>
            <div
              style={{
                fontSize: 10 * scale,
                color: textMutedColor,
                fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              Attendee • VIP Pass
            </div>
          </div>
          <div
            style={{
              width: 24 * scale,
              height: 24 * scale,
              borderRadius: iconStyle === 'pill' ? 999 : 6 * scale,
              backgroundColor: iconBackground,
              border: iconBorder,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={12 * scale} color={iconColor} />
          </div>
        </div>
      </div>
    </div>
  )
}
