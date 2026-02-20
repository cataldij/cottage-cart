'use client'

import type { CSSProperties } from 'react'
import { Star, Heart, ShoppingBag, Clock3, MapPin, User, MessageCircle } from 'lucide-react'

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
  appButtonStyle?: 'solid' | 'outline' | 'soft'
  appButtonColor?: string
  appButtonTextColor?: string
  appTileSize?: 'sm' | 'md' | 'lg' | 'xl'
  appTileColumns?: 2 | 3 | 4 | 5 | 6
  appTileLayout?: 'grid' | 'row'
  appTileGap?: number
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

const iconMap = {
  home: Heart,
  catalog: ShoppingBag,
  orders: Clock3,
  pickup: MapPin,
  messages: MessageCircle,
  account: User,
  reviews: Star,
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
    default:
      return undefined
  }
}

export function AttendeeAppHome({
  eventName,
  tagline,
  venueName,
  bannerUrl,
  primaryColor = '#4E6E52',
  secondaryColor = '#7A5C45',
  accentColor = '#C66A3D',
  backgroundColor = '#F8F3E8',
  surfaceColor = '#FFF9EE',
  textColor = '#2F241D',
  textMutedColor = '#74665B',
  borderColor = '#DCCBB4',
  fontHeading,
  fontBody,
  appButtonStyle = 'solid',
  appButtonColor = '#4E6E52',
  appButtonTextColor = '#ffffff',
  appBackground,
  modules,
  onModuleTap,
  scale = 0.7,
}: AttendeeAppHomeProps) {
  const backgroundStyle: CSSProperties = { backgroundColor }

  if (appBackground?.gradientStart && appBackground?.gradientEnd) {
    backgroundStyle.backgroundImage = `linear-gradient(180deg, ${appBackground.gradientStart}, ${appBackground.gradientEnd})`
  }

  const patternCSS = appBackground?.pattern
    ? getPatternCSS(appBackground.pattern, appBackground.patternColor || 'rgba(0,0,0,0.05)')
    : undefined

  const enabledModules = modules
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6)

  const buttonBackground =
    appButtonStyle === 'outline'
      ? 'transparent'
      : appButtonStyle === 'soft'
        ? `${appButtonColor}22`
        : appButtonColor

  const buttonColor =
    appButtonStyle === 'outline' || appButtonStyle === 'soft'
      ? appButtonColor
      : appButtonTextColor

  const productCards = [
    { name: 'Sourdough Bread', price: '$10.00', note: 'Best seller' },
    { name: 'Blueberry Muffins', price: '$15.00', note: '6-pack' },
    { name: 'Apple Cider Donuts', price: '$8.00', note: 'Half dozen' },
  ]

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
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: patternCSS, backgroundSize: '20px 20px' }}
        />
      )}
      {appBackground?.imageUrl && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${appBackground.imageUrl})` }} />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: `rgba(255,255,255,${appBackground.imageOverlay ?? 0.45})` }} />
        </>
      )}

      <div className="relative z-10 flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div style={{ padding: `${10 * scale}px ${12 * scale}px ${14 * scale}px` }}>
          <div
            style={{
              borderRadius: 16 * scale,
              overflow: 'hidden',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 10px 28px -20px rgba(34, 27, 22, 0.6)',
              backgroundColor: surfaceColor,
            }}
          >
            <div
              style={{
                height: 132 * scale,
                background: bannerUrl
                  ? `url(${bannerUrl}) center/cover no-repeat`
                  : `linear-gradient(120deg, ${secondaryColor} 0%, ${primaryColor} 60%, ${accentColor} 100%)`,
              }}
            />
            <div style={{ padding: 10 * scale }}>
              <p style={{ fontSize: 20 * scale, lineHeight: 1.05, fontWeight: 700, color: textColor, fontFamily: fontHeading }}>
                {eventName}
              </p>
              <p style={{ marginTop: 3 * scale, fontSize: 10 * scale, color: textMutedColor }}>
                {tagline || 'Small-batch goods from our kitchen to your table.'}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Star size={11 * scale} color={accentColor} fill={accentColor} />
                <span style={{ fontSize: 10 * scale, color: textMutedColor }}>4.9 • 221 reviews</span>
              </div>
              <button
                style={{
                  marginTop: 8 * scale,
                  width: '100%',
                  padding: `${7 * scale}px 0`,
                  borderRadius: 999,
                  border: appButtonStyle === 'outline' ? `1px solid ${appButtonColor}` : 'none',
                  background: buttonBackground,
                  color: buttonColor,
                  fontSize: 11 * scale,
                  fontWeight: 600,
                }}
              >
                Follow Shop
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {['All Products', 'Breads', 'Pastries', 'Seasonal'].map((chip, index) => (
              <span
                key={chip}
                style={{
                  whiteSpace: 'nowrap',
                  borderRadius: 999,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: index === 0 ? `${primaryColor}20` : surfaceColor,
                  color: index === 0 ? primaryColor : textMutedColor,
                  padding: `${3 * scale}px ${9 * scale}px`,
                  fontSize: 10 * scale,
                  fontWeight: 600,
                }}
              >
                {chip}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 10 * scale }}>
            <p style={{ fontSize: 11 * scale, fontWeight: 700, color: textColor, marginBottom: 6 * scale }}>
              Baked This Week
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {productCards.map((product) => (
                <div
                  key={product.name}
                  style={{
                    borderRadius: 10 * scale,
                    border: `1px solid ${borderColor}`,
                    padding: 7 * scale,
                    backgroundColor: surfaceColor,
                  }}
                >
                  <p style={{ fontSize: 9 * scale, color: textMutedColor }}>{product.note}</p>
                  <p style={{ marginTop: 3 * scale, fontSize: 10 * scale, fontWeight: 600, color: textColor, lineHeight: 1.2 }}>
                    {product.name}
                  </p>
                  <p style={{ marginTop: 3 * scale, fontSize: 11 * scale, fontWeight: 700, color: primaryColor }}>{product.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 10 * scale }}>
            <p style={{ fontSize: 10 * scale, fontWeight: 700, color: textMutedColor, marginBottom: 6 * scale, textTransform: 'uppercase', letterSpacing: 0.4 * scale }}>
              Shortcuts
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {enabledModules.map((module) => {
                const Icon = iconMap[module.id as keyof typeof iconMap] || ShoppingBag
                return (
                  <button
                    key={module.id}
                    onClick={() => onModuleTap?.(module.id)}
                    style={{
                      borderRadius: 10 * scale,
                      border: `1px solid ${borderColor}`,
                      backgroundColor: surfaceColor,
                      color: textColor,
                      padding: `${8 * scale}px ${6 * scale}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4 * scale,
                    }}
                  >
                    <Icon size={13 * scale} color={primaryColor} />
                    <span style={{ fontSize: 9 * scale, fontWeight: 600 }}>{module.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {venueName && (
            <div
              className="mt-3 flex items-center gap-1.5"
              style={{
                borderRadius: 10 * scale,
                border: `1px solid ${borderColor}`,
                padding: 8 * scale,
                backgroundColor: `${primaryColor}12`,
              }}
            >
              <MapPin size={12 * scale} color={primaryColor} />
              <span style={{ fontSize: 10 * scale, color: textMutedColor }}>{venueName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
