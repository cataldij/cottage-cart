import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SocialLinks } from '@/components/conference/social-links'

async function getConference(slug: string) {
  const supabase = await createClient()

  const { data: conference } = await supabase
    .from('conferences')
    .select(`
      *,
      members:conference_members(count)
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  return conference
}

// Background pattern CSS
const PATTERN_CSS: Record<string, { css: string; size: string }> = {
  dots: {
    css: 'radial-gradient(circle, var(--pattern-color) 1px, transparent 1px)',
    size: '20px 20px',
  },
  grid: {
    css: 'linear-gradient(var(--pattern-color) 1px, transparent 1px), linear-gradient(to right, var(--pattern-color) 1px, transparent 1px)',
    size: '20px 20px',
  },
  diagonal: {
    css: 'repeating-linear-gradient(45deg, var(--pattern-color), var(--pattern-color) 1px, transparent 1px, transparent 10px)',
    size: '14px 14px',
  },
  zigzag: {
    css: 'linear-gradient(135deg, var(--pattern-color) 25%, transparent 25%), linear-gradient(225deg, var(--pattern-color) 25%, transparent 25%), linear-gradient(45deg, var(--pattern-color) 25%, transparent 25%), linear-gradient(315deg, var(--pattern-color) 25%, transparent 25%)',
    size: '20px 20px',
  },
}

// Generate Google Fonts URL for selected fonts
function getGoogleFontsUrl(headingFont?: string, bodyFont?: string): string | null {
  const fonts: string[] = []

  // Map font names to Google Fonts format
  const fontMap: Record<string, string> = {
    'Inter': 'Inter:wght@400;500;600;700',
    'Sora': 'Sora:wght@400;500;600;700',
    'Poppins': 'Poppins:wght@400;500;600;700',
    'Montserrat': 'Montserrat:wght@400;500;600;700',
    'Raleway': 'Raleway:wght@400;500;600;700',
    'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
    'Merriweather': 'Merriweather:wght@400;700',
    'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
    'JetBrains Mono': 'JetBrains+Mono:wght@400;500;600;700',
  }

  if (headingFont && fontMap[headingFont]) {
    fonts.push(fontMap[headingFont])
  }
  if (bodyFont && bodyFont !== headingFont && fontMap[bodyFont]) {
    fonts.push(fontMap[bodyFont])
  }

  if (fonts.length === 0) return null

  return `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}`).join('&')}&display=swap`
}

// Generate CSS variables from conference settings
function generateThemeCSS(conference: any) {
  const patternColor = conference.background_pattern_color || '#00000010'

  return `
    :root {
      --conference-primary: ${conference.primary_color || '#2563eb'};
      --conference-secondary: ${conference.secondary_color || '#1e40af'};
      --conference-accent: ${conference.accent_color || '#f59e0b'};
      --conference-background: ${conference.background_color || '#ffffff'};
      --conference-text: ${conference.text_color || '#1f2937'};
      --conference-heading: ${conference.heading_color || '#111827'};
      --conference-nav-bg: ${conference.nav_background_color || '#ffffff'};
      --conference-nav-text: ${conference.nav_text_color || '#374151'};
      --conference-button: ${conference.button_color || conference.primary_color || '#2563eb'};
      --conference-button-text: ${conference.button_text_color || '#ffffff'};
      --pattern-color: ${patternColor};
    }
  `
}

// Generate background styles from conference settings
function getBackgroundStyles(conference: any) {
  // Custom image background
  if (conference.background_image_url) {
    return {
      backgroundImage: `url(${conference.background_image_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }
  }

  // Pattern background
  if (conference.background_pattern && PATTERN_CSS[conference.background_pattern]) {
    const pattern = PATTERN_CSS[conference.background_pattern]
    return {
      backgroundImage: pattern.css,
      backgroundSize: pattern.size,
    }
  }

  // Gradient background
  if (conference.background_gradient_start && conference.background_gradient_end) {
    return {
      backgroundImage: `linear-gradient(135deg, ${conference.background_gradient_start}, ${conference.background_gradient_end})`,
      backgroundAttachment: 'fixed',
    }
  }

  return {}
}

// Get hero height in pixels
function getHeroHeight(height: string | null) {
  switch (height) {
    case 'small': return 'h-48 md:h-52'
    case 'large': return 'h-80 md:h-[480px]'
    case 'full': return 'h-screen'
    default: return 'h-64 md:h-80'
  }
}

export default async function PublicConferenceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const conference = await getConference(params.slug)

  if (!conference) {
    notFound()
  }

  const startDate = new Date(conference.start_date)
  const endDate = new Date(conference.end_date)

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  // Parse nav items or use defaults
  const navItems = conference.nav_items || [
    { id: 'overview', label: 'Overview', visible: true, order: 1 },
    { id: 'agenda', label: 'Agenda', visible: true, order: 2 },
    { id: 'speakers', label: 'Speakers', visible: true, order: 3 },
    { id: 'sponsors', label: 'Sponsors', visible: true, order: 4 },
    { id: 'attendees', label: 'Attendees', visible: conference.feature_attendee_directory !== false, order: 5 },
  ]

  const visibleNavItems = navItems
    .filter((item: any) => item.visible)
    .sort((a: any, b: any) => a.order - b.order)

  const customNavLinks = conference.custom_nav_links || []

  const heroHeight = getHeroHeight(conference.hero_height)
  const overlayOpacity = conference.hero_overlay_opacity ?? 0.3

  // Check feature flags
  const showAttendees = conference.feature_attendee_directory !== false

  // Get background styles
  const backgroundStyles = getBackgroundStyles(conference)

  // Get Google Fonts URL
  const googleFontsUrl = getGoogleFontsUrl(conference.font_heading, conference.font_body)

  return (
    <>
      {/* Load Google Fonts */}
      {googleFontsUrl && (
        <link rel="stylesheet" href={googleFontsUrl} />
      )}

      {/* Inject theme CSS */}
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(conference) }} />

      {/* Custom CSS if provided */}
      {conference.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: conference.custom_css }} />
      )}

      <div
        className="min-h-screen relative"
        style={{
          backgroundColor: conference.background_color || '#ffffff',
          color: conference.text_color || '#1f2937',
          fontFamily: conference.font_body ? `"${conference.font_body}", sans-serif` : undefined,
          ...backgroundStyles,
        }}
      >
        {/* Overlay for background images to ensure readability */}
        {conference.background_image_url && (
          <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${conference.background_image_overlay || 0.5})`,
            }}
          />
        )}
        {/* Hero Banner */}
        <div
          className={`relative ${heroHeight} z-10`}
          style={{
            backgroundColor: conference.primary_color || '#2563eb',
            backgroundImage: conference.background_gradient_start && conference.background_gradient_end
              ? `linear-gradient(135deg, ${conference.background_gradient_start}, ${conference.background_gradient_end})`
              : undefined
          }}
        >
          {(conference.hero_background_url || conference.banner_url) && (
            <Image
              src={conference.hero_background_url || conference.banner_url}
              alt={conference.name}
              fill
              className="object-cover"
              priority
            />
          )}

          {/* Video background if configured */}
          {conference.hero_style === 'video' && conference.hero_video_url && (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={conference.hero_video_url} type="video/mp4" />
            </video>
          )}

          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          />

          {/* Back button */}
          <div className="absolute top-4 left-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>

          {/* Conference info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <div className="mx-auto max-w-5xl">
              {conference.logo_url && (
                <Image
                  src={conference.logo_url}
                  alt={`${conference.name} logo`}
                  width={80}
                  height={80}
                  className="mb-4 rounded-lg bg-white p-2"
                />
              )}
              <h1
                className="text-3xl md:text-4xl font-bold"
                style={{ fontFamily: conference.font_heading ? `"${conference.font_heading}", sans-serif` : undefined }}
              >
                {conference.name}
              </h1>
              {conference.tagline && (
                <p className="mt-2 text-lg text-white/90">{conference.tagline}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateRange(startDate, endDate)}</span>
                </div>
                {conference.venue_name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{conference.venue_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{conference.members?.[0]?.count || 0} attendees</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="sticky top-0 z-10 border-b backdrop-blur-sm"
          style={{
            backgroundColor: `${conference.nav_background_color || '#ffffff'}e6`,
            color: conference.nav_text_color || '#374151',
          }}
        >
          <div className="mx-auto max-w-5xl px-4">
            <div className="flex items-center justify-between overflow-x-auto">
              <div className="flex gap-1">
                {visibleNavItems.map((item: any) => {
                  const href = item.id === 'overview'
                    ? `/c/${params.slug}`
                    : `/c/${params.slug}/${item.id}`

                  // Skip attendees if feature is disabled
                  if (item.id === 'attendees' && !showAttendees) return null

                  return (
                    <Link
                      key={item.id}
                      href={href}
                      className="px-4 py-3 text-sm font-medium whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {item.label}
                    </Link>
                  )
                })}

                {/* Custom nav links */}
                {customNavLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="px-4 py-3 text-sm font-medium whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              {conference.registration_open && (
                <Button
                  size="sm"
                  asChild
                  style={{
                    backgroundColor: conference.button_color || conference.primary_color || '#2563eb',
                    color: conference.button_text_color || '#ffffff',
                  }}
                  className="ml-4 flex-shrink-0"
                >
                  <Link href={`/c/${params.slug}/register`}>
                    {conference.registration_button_text || 'Register Now'}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">{children}</main>

        {/* Footer */}
        <footer
          className="relative z-10 border-t py-8"
          style={{ backgroundColor: conference.background_color || '#f8fafc' }}
        >
          <div className="mx-auto max-w-5xl px-4">
            {/* Social Links */}
            <SocialLinks conference={conference} />

            {/* Footer content */}
            <div className="text-center text-sm text-muted-foreground mt-6">
              {conference.footer_text ? (
                <p className="mb-2">{conference.footer_text}</p>
              ) : (
                <p className="mb-2">&copy; {new Date().getFullYear()} {conference.name}. Powered by Conference OS.</p>
              )}

              {/* Links row */}
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {conference.website_url && (
                  <a
                    href={conference.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Website
                  </a>
                )}
                {conference.privacy_policy_url && (
                  <a
                    href={conference.privacy_policy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Privacy Policy
                  </a>
                )}
                {conference.terms_url && (
                  <a
                    href={conference.terms_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Terms
                  </a>
                )}
                {conference.code_of_conduct_url && (
                  <a
                    href={conference.code_of_conduct_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Code of Conduct
                  </a>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
