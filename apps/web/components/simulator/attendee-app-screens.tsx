'use client'

import type { CSSProperties, ReactNode } from 'react'
import { ios } from '@makers-market/shop-ui'
import { Clock3, MapPin, Star, User } from 'lucide-react'

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
  appBackground?: {
    pattern?: string | null
    patternColor?: string | null
    gradientStart?: string | null
    gradientEnd?: string | null
    imageUrl?: string | null
    imageOverlay?: number
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
    ? 'rgba(255, 255, 255, 0.72)'
    : cardStyle?.variant === 'white'
      ? '#ffffff'
      : (backgroundColor || ios.colors.systemBackground)

  return { resolvedBorderColor, cardBackground }
}

function buildBackgroundStyle(
  backgroundColor: string,
  appBackground?: ScreenProps['appBackground']
) {
  const style: CSSProperties = { backgroundColor }
  if (appBackground?.gradientStart && appBackground?.gradientEnd) {
    style.backgroundImage = `linear-gradient(180deg, ${appBackground.gradientStart}, ${appBackground.gradientEnd})`
  }
  return style
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

function ScreenShell({
  title,
  children,
  backgroundColor,
  textColor,
  scale = 0.7,
  fontHeading,
  appBackground,
}: {
  title: string
  children: ReactNode
  backgroundColor: string
  textColor: string
  scale?: number
  fontHeading?: string
  appBackground?: ScreenProps['appBackground']
}) {
  const patternCSS = appBackground?.pattern
    ? getPatternCSS(appBackground.pattern, appBackground.patternColor || 'rgba(0,0,0,0.05)')
    : undefined

  return (
    <div className="relative flex h-full flex-col" style={buildBackgroundStyle(backgroundColor, appBackground)}>
      {patternCSS && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: patternCSS, backgroundSize: '20px 20px' }}
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
      <div className="relative z-10" style={{ padding: 12 * scale }}>
        <h2
          style={{
            fontSize: 16 * scale,
            fontWeight: 700,
            color: textColor,
            fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            marginBottom: 8 * scale,
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

export function CatalogScreen({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = '#F8F3E8',
  surfaceColor = '#FFF9EE',
  textColor = '#2F241D',
  textMutedColor = '#74665B',
  borderColor = '#DCCBB4',
  fontHeading,
  fontBody,
  scale = 0.7,
  cardStyle,
  appBackground,
}: ScreenProps) {
  const { resolvedBorderColor, cardBackground } = resolveCardStyle({
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: surfaceColor,
    borderColor,
    cardStyle,
  })

  const products = [
    { name: 'Sourdough Loaf', price: '$10', note: 'Best seller' },
    { name: 'Blueberry Muffins', price: '$15', note: '6-pack' },
    { name: 'Apple Cider Donuts', price: '$8', note: 'Half dozen' },
  ]

  return (
    <ScreenShell
      title="Shop"
      backgroundColor={backgroundColor}
      textColor={textColor}
      scale={scale}
      fontHeading={fontHeading}
      appBackground={appBackground}
    >
      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.name}
            style={{
              backgroundColor: cardBackground,
              borderRadius: ios.radius.lg * scale,
              border: `1px solid ${resolvedBorderColor}`,
              padding: 12 * scale,
              boxShadow: ios.shadow.card,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10 * scale,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 12 * scale,
                  fontWeight: 600,
                  color: textColor,
                  fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
              >
                {product.name}
              </p>
              <p
                style={{
                  fontSize: 10 * scale,
                  color: textMutedColor,
                  fontFamily: fontBody || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                }}
              >
                {product.note}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12 * scale, fontWeight: 700, color: primaryColor }}>{product.price}</p>
              <p style={{ fontSize: 10 * scale, color: textMutedColor }}>Add</p>
            </div>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}

export function OrdersScreen({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = '#F8F3E8',
  surfaceColor = '#FFF9EE',
  textColor = '#2F241D',
  textMutedColor = '#74665B',
  borderColor = '#DCCBB4',
  fontHeading,
  fontBody,
  scale = 0.7,
  cardStyle,
  appBackground,
}: ScreenProps) {
  const { resolvedBorderColor, cardBackground } = resolveCardStyle({
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: surfaceColor,
    borderColor,
    cardStyle,
  })

  const orders = [
    { id: '#112', item: 'Muffin Box', status: 'Ready', eta: 'Sat 10:30 AM' },
    { id: '#109', item: 'Sourdough + Rolls', status: 'Baking', eta: 'Sat 1:00 PM' },
  ]

  return (
    <ScreenShell
      title="Orders"
      backgroundColor={backgroundColor}
      textColor={textColor}
      scale={scale}
      fontHeading={fontHeading}
      appBackground={appBackground}
    >
      <div className="space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              backgroundColor: cardBackground,
              borderRadius: ios.radius.lg * scale,
              border: `1px solid ${resolvedBorderColor}`,
              padding: 12 * scale,
              boxShadow: ios.shadow.card,
            }}
          >
            <div className="flex items-center justify-between">
              <p style={{ fontSize: 11 * scale, fontWeight: 700, color: primaryColor }}>{order.id}</p>
              <p style={{ fontSize: 10 * scale, color: textMutedColor }}>{order.eta}</p>
            </div>
            <p
              style={{
                fontSize: 12 * scale,
                fontWeight: 600,
                color: textColor,
                marginTop: 4 * scale,
                fontFamily: fontHeading || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              {order.item}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <Clock3 size={11 * scale} color={primaryColor} />
              <p style={{ fontSize: 10 * scale, color: textMutedColor, fontFamily: fontBody }}>{order.status}</p>
            </div>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}

export function PickupScreen({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = '#F8F3E8',
  surfaceColor = '#FFF9EE',
  textColor = '#2F241D',
  textMutedColor = '#74665B',
  borderColor = '#DCCBB4',
  fontHeading,
  fontBody,
  scale = 0.7,
  cardStyle,
  appBackground,
}: ScreenProps) {
  const { resolvedBorderColor, cardBackground } = resolveCardStyle({
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: surfaceColor,
    borderColor,
    cardStyle,
  })

  return (
    <ScreenShell
      title="Pickup"
      backgroundColor={backgroundColor}
      textColor={textColor}
      scale={scale}
      fontHeading={fontHeading}
      appBackground={appBackground}
    >
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
            height: 116 * scale,
            borderRadius: ios.radius.md * scale,
            background: `linear-gradient(135deg, ${primaryColor}25, ${accentColor || primaryColor}35)`,
            border: `1px solid ${resolvedBorderColor}`,
          }}
        />
        <div className="mt-2 flex items-start gap-2">
          <MapPin size={13 * scale} color={primaryColor} />
          <div>
            <p style={{ fontSize: 12 * scale, fontWeight: 600, color: textColor, fontFamily: fontHeading }}>
              Front Porch Pickup
            </p>
            <p style={{ fontSize: 10 * scale, color: textMutedColor, fontFamily: fontBody }}>
              Saturdays 9 AM - 2 PM
            </p>
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}

export function AccountScreen({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor = '#F8F3E8',
  surfaceColor = '#FFF9EE',
  textColor = '#2F241D',
  textMutedColor = '#74665B',
  borderColor = '#DCCBB4',
  fontHeading,
  fontBody,
  scale = 0.7,
  cardStyle,
  appBackground,
}: ScreenProps) {
  const { resolvedBorderColor, cardBackground } = resolveCardStyle({
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor: surfaceColor,
    borderColor,
    cardStyle,
  })

  return (
    <ScreenShell
      title="Account"
      backgroundColor={backgroundColor}
      textColor={textColor}
      scale={scale}
      fontHeading={fontHeading}
      appBackground={appBackground}
    >
      <div
        style={{
          backgroundColor: cardBackground,
          borderRadius: ios.radius.lg * scale,
          border: `1px solid ${resolvedBorderColor}`,
          padding: 12 * scale,
          boxShadow: ios.shadow.card,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 36 * scale,
              height: 36 * scale,
              borderRadius: 999,
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor || primaryColor})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={13 * scale} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 12 * scale, fontWeight: 600, color: textColor, fontFamily: fontHeading }}>
              Jordan Lee
            </p>
            <p style={{ fontSize: 10 * scale, color: textMutedColor, fontFamily: fontBody }}>
              Weekly pickup member
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 10 * scale, color: textMutedColor }}>Saved orders</span>
            <span style={{ fontSize: 10 * scale, fontWeight: 600, color: primaryColor }}>6</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 10 * scale, color: textMutedColor }}>Favorite shop</span>
            <span style={{ fontSize: 10 * scale, fontWeight: 600, color: primaryColor, display: 'flex', gap: 2 }}>
              <Star size={10 * scale} color={primaryColor} /> Lisa's Home Bakery
            </span>
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}

// Backward-compatible exports for existing imports
export const AgendaScreen = CatalogScreen
export const SpeakersScreen = OrdersScreen
export const MapScreen = PickupScreen
export const ProfileScreen = AccountScreen
