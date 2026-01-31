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
  bannerUrl?: string | null
  logoUrl?: string | null
  sessions?: Array<{ id: string; title: string; room?: string }>
  speakers?: Array<{ id: string; name: string; title?: string; avatarUrl?: string }>
  sponsors?: Array<{ id: string; name: string; logoUrl?: string; tier: string }>
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
  bannerUrl,
  logoUrl,
  sessions = [],
  speakers = [],
  sponsors = [],
}: DesktopWebsitePreviewProps) {
  const gradientHero = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor || adjustColor(primaryColor, -20)} 100%)`

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
    <div className="min-h-full bg-white">
      {/* Navigation Bar */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={eventName} className="h-10 w-auto" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-lg font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              {eventName.charAt(0)}
            </div>
          )}
          <span className="text-lg font-semibold text-gray-900">{eventName}</span>
        </div>

        <div className="flex items-center gap-8">
          {['Schedule', 'Speakers', 'Sponsors', 'Venue'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item}
            </a>
          ))}
          <button
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            Register Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: gradientHero,
          minHeight: 400,
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white mb-6">
            <Calendar className="h-4 w-4" />
            {formatDate(startDate)} {endDate && `- ${formatDate(endDate)}`}
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            {eventName}
          </h1>

          {tagline && (
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {tagline}
            </p>
          )}

          <div className="flex items-center justify-center gap-4">
            <button
              className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold shadow-lg transition-transform hover:scale-105"
              style={{ color: primaryColor }}
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
        className="border-b border-gray-100"
        style={{ backgroundColor: '#fafafa' }}
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
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Sessions */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Sessions</h2>
            <p className="text-gray-500">Explore our curated selection of talks and workshops</p>
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
              className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-200"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700">
                {session.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
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
      <section style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Speakers</h2>
              <p className="text-gray-500">Learn from industry leaders and innovators</p>
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
                <h3 className="font-semibold text-gray-900">{speaker.name}</h3>
                {speaker.title && (
                  <p className="text-sm text-gray-500">{speaker.title}</p>
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
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Don't miss out on this incredible experience. Register today and be part of something amazing.
          </p>
          <button className="rounded-full bg-white px-8 py-4 text-base font-semibold shadow-lg transition-transform hover:scale-105" style={{ color: primaryColor }}>
            Register Now - Starting at $199
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {eventName.charAt(0)}
              </div>
              <span className="font-semibold text-gray-900">{eventName}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
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
