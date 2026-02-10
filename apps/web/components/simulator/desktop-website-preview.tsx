'use client'

import { useState } from 'react'
import { Calendar, MapPin, Clock, Users, ChevronRight, Play, ArrowRight } from 'lucide-react'

interface DesktopWebsitePreviewProps {
  eventName: string
  tagline?: string
  startDate?: string
  endDate?: string
  venueName?: string
  primaryColor: string
  secondaryColor?: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  navBackgroundColor?: string
  navTextColor?: string
  buttonColor?: string
  buttonTextColor?: string
  registrationButtonText?: string
  bannerUrl?: string | null
  logoUrl?: string | null
  fontHeading?: string
  fontBody?: string
  // Hero settings
  heroStyle?: 'image' | 'video' | 'gradient'
  heroHeight?: 'small' | 'medium' | 'large' | 'full'
  heroBackgroundUrl?: string | null
  heroVideoUrl?: string | null
  heroOverlayOpacity?: number
  // Background settings
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'diagonal' | 'zigzag'
  backgroundPatternColor?: string
  backgroundGradientStart?: string
  backgroundGradientEnd?: string
  backgroundImageUrl?: string | null
  backgroundImageOverlay?: number
  // Content
  sessions?: Array<{ id: string; title: string; room?: string }>
  speakers?: Array<{ id: string; name: string; title?: string; avatarUrl?: string }>
  sponsors?: Array<{ id: string; name: string; logoUrl?: string; tier: string }>
}

// Map hero height to pixel values
function getHeroMinHeight(height?: string): number {
  switch (height) {
    case 'small': return 280
    case 'large': return 520
    case 'full': return 600
    default: return 400
  }
}

/**
 * Professional desktop conference website preview
 * Looks like a real deployed conference landing page
 */
// Generate background pattern CSS
function getPatternCSS(pattern?: string, color?: string): string | undefined {
  if (!pattern || pattern === 'none') return undefined
  const c = color || 'rgba(0,0,0,0.05)'
  switch (pattern) {
    case 'dots':
      return `radial-gradient(circle at 1px 1px, ${c} 1px, transparent 0)`
    case 'grid':
      return `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`
    case 'diagonal':
      return `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent 10px)`
    case 'zigzag':
      return `linear-gradient(135deg, ${c} 25%, transparent 25%), linear-gradient(225deg, ${c} 25%, transparent 25%), linear-gradient(45deg, ${c} 25%, transparent 25%), linear-gradient(315deg, ${c} 25%, transparent 25%)`
    default:
      return undefined
  }
}

export function DesktopWebsitePreview({
  eventName,
  tagline,
  startDate,
  endDate,
  venueName,
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
  navBackgroundColor = '#ffffff',
  navTextColor = '#374151',
  buttonColor,
  buttonTextColor = '#ffffff',
  registrationButtonText = 'Register Now',
  bannerUrl,
  logoUrl,
  fontHeading = 'Inter',
  fontBody = 'Inter',
  // Hero settings
  heroStyle = 'gradient',
  heroHeight = 'medium',
  heroBackgroundUrl,
  heroVideoUrl,
  heroOverlayOpacity = 0.3,
  // Background settings
  backgroundPattern = 'none',
  backgroundPatternColor,
  backgroundGradientStart,
  backgroundGradientEnd,
  backgroundImageUrl,
  backgroundImageOverlay = 0.5,
  // Content
  sessions = [],
  speakers = [],
  sponsors = [],
}: DesktopWebsitePreviewProps) {
  const gradientHero = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor || adjustColor(primaryColor, -20)} 100%)`
  const effectiveButtonColor = buttonColor || primaryColor
  const heroMinHeight = getHeroMinHeight(heroHeight)

  // Use heroBackgroundUrl if set, otherwise fall back to bannerUrl
  const effectiveHeroImage = heroBackgroundUrl || bannerUrl

  // Determine what to show in hero based on style
  const showHeroImage = heroStyle === 'image' && effectiveHeroImage
  const showHeroVideo = heroStyle === 'video' && heroVideoUrl
  const showHeroGradient = heroStyle === 'gradient' || (!showHeroImage && !showHeroVideo)

  // Background pattern CSS
  const patternCSS = getPatternCSS(backgroundPattern, backgroundPatternColor)

  // Background gradient for page
  const pageBackgroundGradient = backgroundGradientStart && backgroundGradientEnd
    ? `linear-gradient(180deg, ${backgroundGradientStart}, ${backgroundGradientEnd})`
    : undefined

  // Mock data for realistic preview
  const mockSessions = sessions.length > 0 ? sessions : [
    { id: '1', title: 'Opening Keynote: The Future of Technology', room: 'Main Hall' },
    { id: '2', title: 'Building Scalable Systems at Scale', room: 'Room A' },
    { id: '3', title: 'Workshop: Hands-on AI Development', room: 'Workshop Hall' },
    { id: '4', title: 'Panel: Industry Leaders Roundtable', room: 'Main Hall' },
    { id: '5', title: 'Networking Break & Demos', room: 'Exhibition Hall' },
    { id: '6', title: 'Closing Remarks & Awards', room: 'Main Hall' },
  ]

  const mockSpeakers = speakers.length > 0 ? speakers : [
    { id: '1', name: 'Sarah Chen', title: 'CEO, TechCorp', avatarUrl: null },
    { id: '2', name: 'Marcus Johnson', title: 'CTO, Innovation Labs', avatarUrl: null },
    { id: '3', name: 'Emily Rodriguez', title: 'VP Engineering, CloudScale', avatarUrl: null },
    { id: '4', name: 'David Kim', title: 'Founder, AI Ventures', avatarUrl: null },
  ]

  const mockSponsors = sponsors.length > 0 ? sponsors : [
    { id: '1', name: 'Aurora', tier: 'Platinum' },
    { id: '2', name: 'Northwind', tier: 'Gold' },
    { id: '3', name: 'SummitWorks', tier: 'Silver' },
    { id: '4', name: 'Atlas Collective', tier: 'Gold' },
  ]

  const [activeSection, setActiveSection] = useState<'schedule' | 'speakers' | 'sponsors' | 'venue'>('schedule')

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return 'TBD'
    }
  }

  return (
    <div
      className="min-h-full relative"
      style={{
        backgroundColor,
        fontFamily: `"${fontBody}", sans-serif`,
        background: pageBackgroundGradient || backgroundColor,
      }}
    >
      {/* Background pattern overlay */}
      {patternCSS && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: patternCSS,
            backgroundSize: backgroundPattern === 'zigzag' ? '20px 20px' : '20px 20px',
          }}
        />
      )}

      {/* Background image overlay */}
      {backgroundImageUrl && (
        <>
          <div
            className="absolute inset-0 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: `rgba(255, 255, 255, ${backgroundImageOverlay})` }}
          />
        </>
      )}
      {/* Navigation Bar */}
      <nav
        className="relative sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          backgroundColor: `${navBackgroundColor}f2`,
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e5e7eb',
          color: navTextColor,
        }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={eventName} className="h-10 w-auto" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold"
              style={{ backgroundColor: primaryColor, color: buttonTextColor }}
            >
              {eventName.charAt(0)}
            </div>
          )}
          <span className="text-lg font-semibold" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>{eventName}</span>
        </div>

        <div className="flex items-center gap-8">
          {([
            { id: 'schedule', label: 'Schedule' },
            { id: 'speakers', label: 'Speakers' },
            { id: 'sponsors', label: 'Sponsors' },
            { id: 'venue', label: 'Venue' },
          ] as const).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{
                color: navTextColor,
                borderBottom: activeSection === item.id ? `2px solid ${primaryColor}` : '2px solid transparent',
                paddingBottom: 4,
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            className="rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
            style={{ backgroundColor: effectiveButtonColor, color: buttonTextColor }}
          >
            {registrationButtonText}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: showHeroGradient ? gradientHero : undefined,
          minHeight: heroMinHeight,
        }}
      >
        {/* Hero image */}
        {showHeroImage && (
          <>
            <img
              src={effectiveHeroImage}
              alt={eventName}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0, 0, 0, ${heroOverlayOpacity})` }}
            />
          </>
        )}

        {/* Hero video */}
        {showHeroVideo && (
          <>
            <video
              src={heroVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0, 0, 0, ${heroOverlayOpacity})` }}
            />
          </>
        )}

        {/* Background pattern for gradient hero */}
        {showHeroGradient && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        )}

        <div className="relative max-w-6xl mx-auto px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white mb-6">
            <Calendar className="h-4 w-4" />
            {formatDate(startDate)} {endDate && `- ${formatDate(endDate)}`}
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: `"${fontHeading}", sans-serif` }}>
            {eventName}
          </h1>

          {tagline && (
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {tagline}
            </p>
          )}

          <div className="flex items-center justify-center gap-4">
            <button
              className="flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor || '#ffffff', color: accentColor ? buttonTextColor : effectiveButtonColor }}
            >
              Get Your Ticket
              <ArrowRight className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
              <Play className="h-4 w-4" />
              Watch Trailer
            </button>
          </div>

          {venueName && (
            <div className="flex items-center justify-center gap-2 mt-8 text-white/80">
              <MapPin className="h-4 w-4" />
              <span>{venueName}</span>
            </div>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <section
        className="border-b"
        style={{ backgroundColor: `${backgroundColor}f8`, borderColor: `${textColor}15` }}
      >
        <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-4 gap-8">
          {[
            { label: 'Sessions', value: mockSessions.length.toString(), icon: Calendar },
            { label: 'Speakers', value: mockSpeakers.length.toString(), icon: Users },
            { label: 'Workshops', value: '12', icon: Clock },
            { label: 'Attendees', value: '500+', icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-6 w-6 mx-auto mb-2" style={{ color: primaryColor }} />
              <div className="text-3xl font-bold" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>{stat.value}</div>
              <div className="text-sm" style={{ color: `${textColor}80` }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Sessions */}
      {activeSection === 'schedule' && (
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>Featured Sessions</h2>
            <p style={{ color: `${textColor}99` }}>Explore our curated selection of talks and workshops</p>
          </div>
          <a
            href="#"
            className="flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
            style={{ color: primaryColor }}
          >
            View full schedule
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {mockSessions.slice(0, 3).map((session, index) => (
            <div
              key={session.id}
              className="group rounded-2xl border p-6 transition-all hover:shadow-lg"
              style={{ backgroundColor, borderColor: `${textColor}15` }}
            >
              <div
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mb-4"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                {index === 0 ? 'Keynote' : index === 2 ? 'Workshop' : 'Talk'}
              </div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>
                {session.title}
              </h3>
              <div className="flex items-center gap-4 text-sm" style={{ color: `${textColor}80` }}>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  45 min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {session.room}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Speakers Section */}
      {activeSection === 'speakers' && (
      <section style={{ backgroundColor: `${backgroundColor}f0` }}>
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>Featured Speakers</h2>
              <p style={{ color: `${textColor}99` }}>Learn from industry leaders and innovators</p>
            </div>
            <a
              href="#"
              className="flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
              style={{ color: primaryColor }}
            >
              View all speakers
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {mockSpeakers.slice(0, 4).map((speaker) => (
              <div key={speaker.id} className="text-center group">
                <div
                  className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  {speaker.avatarUrl ? (
                    <img
                      src={speaker.avatarUrl}
                      alt={speaker.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-3xl font-semibold" style={{ color: primaryColor }}>
                      {speaker.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>{speaker.name}</h3>
                {speaker.title && (
                  <p className="text-sm" style={{ color: `${textColor}80` }}>{speaker.title}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Sponsors Section */}
      {activeSection === 'sponsors' && (
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>Sponsors</h2>
            <p style={{ color: `${textColor}99` }}>Our partners powering the event</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {mockSponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="rounded-2xl border p-5 text-center"
              style={{ backgroundColor, borderColor: `${textColor}15` }}
            >
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {sponsor.name.charAt(0)}
              </div>
              <div className="font-semibold" style={{ color: textColor }}>{sponsor.name}</div>
              <div className="text-xs uppercase tracking-wide" style={{ color: `${textColor}80` }}>
                {sponsor.tier}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Venue Section */}
      {activeSection === 'venue' && (
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>Venue</h2>
            <p style={{ color: `${textColor}99` }}>Find your way around the event</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div
            className="rounded-2xl border"
            style={{ backgroundColor, borderColor: `${textColor}15` }}
          >
            <div
              className="h-64 w-full rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor || primaryColor}35)` }}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color: primaryColor }} />
              <span style={{ color: textColor, fontWeight: 600 }}>{venueName || 'Moscone Center'}</span>
            </div>
            <div style={{ color: `${textColor}80` }}>
              747 Howard St, San Francisco, CA
            </div>
            <div className="rounded-xl border p-4" style={{ backgroundColor, borderColor: `${textColor}15` }}>
              <div className="text-sm font-semibold" style={{ color: textColor }}>Directions</div>
              <div className="text-sm" style={{ color: `${textColor}80` }}>Use main entrance on Howard St. Doors open at 8:00 AM.</div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section
        className="relative overflow-hidden"
        style={{ background: gradientHero }}
      >
        <div className="max-w-4xl mx-auto px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: `"${fontHeading}", sans-serif` }}>
            Ready to Join Us?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Don't miss out on this incredible experience. Register today and be part of something amazing.
          </p>
          <button
            className="rounded-full px-8 py-4 text-base font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: accentColor || '#ffffff', color: accentColor ? buttonTextColor : effectiveButtonColor }}
          >
            Register Now - Starting at $199
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ backgroundColor: `${backgroundColor}f8`, borderColor: `${textColor}20` }}>
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{ backgroundColor: primaryColor, color: buttonTextColor }}
              >
                {eventName.charAt(0)}
              </div>
              <span className="font-semibold" style={{ color: textColor, fontFamily: `"${fontHeading}", sans-serif` }}>{eventName}</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: `${textColor}99` }}>
              <a href="#" className="hover:opacity-80">Privacy</a>
              <a href="#" className="hover:opacity-80">Terms</a>
              <a href="#" className="hover:opacity-80">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper to darken/lighten a color
function adjustColor(color: string, amount: number): string {
  const clamp = (val: number) => Math.min(255, Math.max(0, val))

  // Parse hex color
  let hex = color.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  const newR = clamp(r + amount)
  const newG = clamp(g + amount)
  const newB = clamp(b + amount)

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}
