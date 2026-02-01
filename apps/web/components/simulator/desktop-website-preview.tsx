'use client'

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
  bannerUrl?: string | null
  logoUrl?: string | null
  fontHeading?: string
  fontBody?: string
  heroHeight?: 'small' | 'medium' | 'large' | 'full'
  heroOverlayOpacity?: number
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
  bannerUrl,
  logoUrl,
  fontHeading = 'Inter',
  fontBody = 'Inter',
  heroHeight = 'medium',
  heroOverlayOpacity = 0.3,
  sessions = [],
  speakers = [],
  sponsors = [],
}: DesktopWebsitePreviewProps) {
  const gradientHero = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor || adjustColor(primaryColor, -20)} 100%)`
  const effectiveButtonColor = buttonColor || primaryColor
  const heroMinHeight = getHeroMinHeight(heroHeight)

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
    <div className="min-h-full" style={{ backgroundColor, fontFamily: `"${fontBody}", sans-serif` }}>
      {/* Navigation Bar */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
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
          {['Schedule', 'Speakers', 'Sponsors', 'Venue'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: navTextColor }}
            >
              {item}
            </a>
          ))}
          <button
            className="rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
            style={{ backgroundColor: effectiveButtonColor, color: buttonTextColor }}
          >
            Register Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: bannerUrl ? undefined : gradientHero,
          minHeight: heroMinHeight,
        }}
      >
        {/* Banner image if provided */}
        {bannerUrl && (
          <>
            <img
              src={bannerUrl}
              alt={eventName}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0, 0, 0, ${heroOverlayOpacity})` }}
            />
          </>
        )}

        {/* Background pattern for gradient hero */}
        {!bannerUrl && (
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

      {/* Speakers Section */}
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
