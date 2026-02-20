'use client'

import { useState } from 'react'
import { Calendar, ChevronRight, Clock, MapPin, Star } from 'lucide-react'

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
  headingColor?: string
  navBackgroundColor?: string
  navTextColor?: string
  buttonColor?: string
  buttonTextColor?: string
  registrationButtonText?: string
  bannerUrl?: string | null
  logoUrl?: string | null
  fontHeading?: string
  fontBody?: string
  heroStyle?: 'image' | 'video' | 'gradient'
  heroHeight?: 'small' | 'medium' | 'large' | 'full'
  heroBackgroundUrl?: string | null
  heroVideoUrl?: string | null
  heroOverlayOpacity?: number
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'diagonal' | 'zigzag'
  backgroundPatternColor?: string
  backgroundGradientStart?: string
  backgroundGradientEnd?: string
  backgroundImageUrl?: string | null
  backgroundImageOverlay?: number
  sessions?: Array<{ id: string; title: string; room?: string }>
  speakers?: Array<{ id: string; name: string; title?: string; avatarUrl?: string }>
  sponsors?: Array<{ id: string; name: string; logoUrl?: string; tier: string }>
}

function getHeroMinHeight(height?: string): number {
  switch (height) {
    case 'small':
      return 300
    case 'large':
      return 560
    case 'full':
      return 640
    default:
      return 430
  }
}

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
  backgroundColor = '#F8F3E8',
  textColor = '#2F241D',
  headingColor,
  navBackgroundColor = '#FFF8EE',
  navTextColor = '#4E6E52',
  buttonColor,
  buttonTextColor = '#ffffff',
  registrationButtonText = 'Shop This Week',
  bannerUrl,
  logoUrl,
  fontHeading = 'Playfair Display',
  fontBody = 'DM Sans',
  heroStyle = 'image',
  heroHeight = 'medium',
  heroBackgroundUrl,
  heroVideoUrl,
  heroOverlayOpacity = 0.28,
  backgroundPattern = 'none',
  backgroundPatternColor,
  backgroundGradientStart,
  backgroundGradientEnd,
  backgroundImageUrl,
  backgroundImageOverlay = 0.4,
  sessions = [],
  speakers = [],
  sponsors = [],
}: DesktopWebsitePreviewProps) {
  const effectiveHeadingColor = headingColor || textColor
  const effectiveButtonColor = buttonColor || primaryColor
  const effectiveHeroImage = heroBackgroundUrl || bannerUrl
  const showHeroImage = heroStyle === 'image' && effectiveHeroImage
  const showHeroVideo = heroStyle === 'video' && heroVideoUrl
  const showHeroGradient = heroStyle === 'gradient' || (!showHeroImage && !showHeroVideo)
  const heroMinHeight = getHeroMinHeight(heroHeight)
  const gradientHero = `linear-gradient(130deg, ${primaryColor} 0%, ${secondaryColor || primaryColor} 55%, ${accentColor || secondaryColor || primaryColor} 100%)`
  const patternCSS = getPatternCSS(backgroundPattern, backgroundPatternColor)
  const pageBackgroundGradient = backgroundGradientStart && backgroundGradientEnd
    ? `linear-gradient(180deg, ${backgroundGradientStart}, ${backgroundGradientEnd})`
    : undefined

  const [activeSection, setActiveSection] = useState<'menu' | 'reviews' | 'pickup' | 'about'>('menu')

  const menuItems = sessions.length > 0
    ? sessions.map((session, index) => ({
        id: session.id,
        name: session.title,
        subtitle: session.room || 'Seasonal favorite',
        price: `$${(8 + index * 3).toFixed(2)}`,
      }))
    : [
        { id: '1', name: 'Country Sourdough', subtitle: 'Long-fermented loaf', price: '$10.00' },
        { id: '2', name: 'Blueberry Muffin Box', subtitle: '6-pack, fresh baked', price: '$15.00' },
        { id: '3', name: 'Strawberry Rhubarb Jam', subtitle: 'Small batch jar', price: '$8.00' },
        { id: '4', name: 'Cinnamon Roll Tray', subtitle: 'Weekend special', price: '$18.00' },
      ]

  const reviews = speakers.length > 0
    ? speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        quote: speaker.title || 'Always fresh, always friendly, and absolutely delicious.',
      }))
    : [
        { id: 'r1', name: 'Maya R.', quote: 'Everything tasted homemade in the best way. Pickup was smooth and easy.' },
        { id: 'r2', name: 'Chris L.', quote: 'The sourdough is incredible. We order every week now.' },
        { id: 'r3', name: 'Jordan K.', quote: 'Beautiful storefront, clear instructions, and fantastic baked goods.' },
      ]

  const partners = sponsors.length > 0
    ? sponsors
    : [
        { id: 'p1', name: 'Maple Farm Eggs', tier: 'Local Partner' },
        { id: 'p2', name: 'River Mill Flour', tier: 'Ingredient Partner' },
        { id: 'p3', name: 'Orchard Co-op', tier: 'Seasonal Produce' },
      ]

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'TBD'
    }
  }

  return (
    <div
      className="min-h-full relative"
      style={{
        background: pageBackgroundGradient || backgroundColor,
        color: textColor,
        fontFamily: `"${fontBody}", sans-serif`,
      }}
    >
      {patternCSS && (
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{ backgroundImage: patternCSS, backgroundSize: '20px 20px' }}
        />
      )}
      {backgroundImageUrl && (
        <>
          <div className="absolute inset-0 pointer-events-none bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: `rgba(255,255,255,${backgroundImageOverlay})` }} />
        </>
      )}

      <nav
        className="relative sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b"
        style={{ backgroundColor: `${navBackgroundColor}f2`, borderColor: `${textColor}22`, backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={eventName} className="h-9 w-auto rounded-lg" />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
              style={{ backgroundColor: primaryColor, color: buttonTextColor }}
            >
              {eventName.charAt(0)}
            </div>
          )}
          <span style={{ color: navTextColor, fontFamily: `"${fontHeading}", sans-serif` }} className="text-lg font-semibold">
            {eventName}
          </span>
        </div>
        <div className="flex items-center gap-6">
          {([
            { id: 'menu', label: 'Menu' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'pickup', label: 'Pickup' },
            { id: 'about', label: 'About' },
          ] as const).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className="text-sm font-medium"
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
            className="rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: effectiveButtonColor, color: buttonTextColor }}
          >
            {registrationButtonText}
          </button>
        </div>
      </nav>

      <section className="relative overflow-hidden" style={{ minHeight: heroMinHeight, background: showHeroGradient ? gradientHero : undefined }}>
        {showHeroImage && (
          <>
            <img src={effectiveHeroImage || ''} alt={eventName} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${heroOverlayOpacity})` }} />
          </>
        )}
        {showHeroVideo && (
          <>
            <video src={heroVideoUrl || ''} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${heroOverlayOpacity})` }} />
          </>
        )}
        <div className="relative mx-auto flex max-w-6xl flex-col items-start px-8 py-20 text-white">
          <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide">
            Local • Small Batch • Fresh
          </span>
          <h1 className="mt-5 text-5xl font-semibold leading-tight" style={{ fontFamily: `"${fontHeading}", sans-serif` }}>
            {eventName}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">
            {tagline || 'Order handcrafted favorites from a trusted neighborhood maker.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-full px-7 py-3 text-sm font-semibold" style={{ backgroundColor: accentColor || '#ffffff', color: '#1f1f1f' }}>
              Shop Menu
            </button>
            <button className="rounded-full border border-white/35 bg-white/10 px-7 py-3 text-sm font-semibold">
              Follow Shop
            </button>
          </div>
          <div className="mt-6 flex items-center gap-5 text-sm text-white/85">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDate(startDate)} - {formatDate(endDate)}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {venueName || 'Front Porch Pickup'}</span>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-8 py-12">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Avg Rating', value: '4.9/5' },
            { label: 'Orders This Week', value: '42' },
            { label: 'Pickup Window', value: 'Sat' },
            { label: 'Response Time', value: '< 1 hr' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border p-4" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff8ef' }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: `${textColor}88` }}>{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: effectiveHeadingColor, fontFamily: `"${fontHeading}", sans-serif` }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {activeSection === 'menu' && (
        <section className="relative mx-auto max-w-6xl px-8 pb-14">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-semibold" style={{ fontFamily: `"${fontHeading}", sans-serif`, color: effectiveHeadingColor }}>
                This Week&apos;s Menu
              </h2>
              <p className="mt-2 text-sm" style={{ color: `${textColor}aa` }}>
                Freshly prepared items available for preorder.
              </p>
            </div>
            <button className="flex items-center gap-1 text-sm font-semibold" style={{ color: primaryColor }}>
              View full menu <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {menuItems.map((item) => (
              <div key={item.id} className="rounded-2xl border p-5" style={{ borderColor: `${textColor}22`, backgroundColor: '#fffaf1' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: effectiveHeadingColor, fontFamily: `"${fontHeading}", sans-serif` }}>{item.name}</h3>
                    <p className="mt-1 text-sm" style={{ color: `${textColor}99` }}>{item.subtitle}</p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: primaryColor }}>{item.price}</p>
                </div>
                <button className="mt-4 rounded-full px-4 py-2 text-xs font-semibold" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                  Add to preorder
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'reviews' && (
        <section className="relative mx-auto max-w-6xl px-8 pb-14">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: `"${fontHeading}", sans-serif`, color: effectiveHeadingColor }}>
            Customer Reviews
          </h2>
          <div className="mt-7 grid grid-cols-3 gap-5">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border p-5" style={{ borderColor: `${textColor}22`, backgroundColor: '#fffaf1' }}>
                <div className="mb-3 flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((v) => (
                    <Star key={v} className="h-4 w-4" fill={accentColor || '#d97706'} color={accentColor || '#d97706'} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: `${textColor}cc` }}>&quot;{review.quote}&quot;</p>
                <p className="mt-4 text-sm font-semibold" style={{ color: effectiveHeadingColor }}>{review.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'pickup' && (
        <section className="relative mx-auto max-w-6xl px-8 pb-14">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: `"${fontHeading}", sans-serif`, color: effectiveHeadingColor }}>
            Pickup Details
          </h2>
          <div className="mt-7 grid grid-cols-2 gap-7">
            <div className="rounded-2xl border p-3" style={{ borderColor: `${textColor}22`, backgroundColor: '#fffaf1' }}>
              <div style={{ height: 280, borderRadius: 14, background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor || primaryColor}35)` }} />
            </div>
            <div className="space-y-4 rounded-2xl border p-6" style={{ borderColor: `${textColor}22`, backgroundColor: '#fffaf1' }}>
              <p className="text-xl font-semibold" style={{ fontFamily: `"${fontHeading}", sans-serif`, color: effectiveHeadingColor }}>
                {venueName || 'Front Porch Pickup'}
              </p>
              <p className="text-sm" style={{ color: `${textColor}aa` }}>
                123 Maple St, Hometown, USA
              </p>
              <div className="rounded-xl border p-4" style={{ borderColor: `${textColor}22` }}>
                <p className="text-sm font-semibold" style={{ color: effectiveHeadingColor }}>Pickup Instructions</p>
                <p className="mt-1 text-sm" style={{ color: `${textColor}aa` }}>
                  Use the side gate and check in with your order number. Please arrive within your selected pickup window.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: `${textColor}aa` }}>
                <Clock className="h-4 w-4" style={{ color: primaryColor }} />
                Saturdays 9:00 AM - 2:00 PM
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'about' && (
        <section className="relative mx-auto max-w-6xl px-8 pb-14">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: `"${fontHeading}", sans-serif`, color: effectiveHeadingColor }}>
            Our Maker Story
          </h2>
          <div className="mt-7 grid grid-cols-[1.4fr_0.6fr] gap-6">
            <div className="rounded-2xl border p-6" style={{ borderColor: `${textColor}22`, backgroundColor: '#fffaf1' }}>
              <p className="text-sm leading-relaxed" style={{ color: `${textColor}cc` }}>
                We started baking for neighbors and quickly grew into a weekly community tradition. Every item is made in small batches,
                with seasonal ingredients and clear allergen information so customers can order confidently.
              </p>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: `${textColor}cc` }}>
                Maker&apos;s Market storefronts help local food sellers create a polished online presence while keeping the heart of homemade food at the center.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border p-5" style={{ borderColor: `${textColor}22`, backgroundColor: '#fffaf1' }}>
              <p className="text-sm font-semibold" style={{ color: effectiveHeadingColor }}>Local Partners</p>
              {partners.map((partner) => (
                <div key={partner.id} className="rounded-xl border p-3" style={{ borderColor: `${textColor}22` }}>
                  <p className="text-sm font-semibold" style={{ color: effectiveHeadingColor }}>{partner.name}</p>
                  <p className="text-xs" style={{ color: `${textColor}88` }}>{partner.tier}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden" style={{ background: gradientHero }}>
        <div className="mx-auto max-w-4xl px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: `"${fontHeading}", sans-serif` }}>
            Ready to Place Your Order?
          </h2>
          <p className="mt-3 text-white/85">
            Reserve this week&apos;s bakes before they sell out.
          </p>
          <button className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-semibold" style={{ color: primaryColor }}>
            Start Shopping
          </button>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff8ee' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-9">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
            <span style={{ color: effectiveHeadingColor, fontFamily: `"${fontHeading}", sans-serif` }}>{eventName}</span>
          </div>
          <div className="flex gap-6 text-xs" style={{ color: `${textColor}99` }}>
            <span>Food Safety</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
