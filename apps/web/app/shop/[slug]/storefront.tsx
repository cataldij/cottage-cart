'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ShoppingBag, Instagram, ExternalLink } from 'lucide-react'
import { DEFAULT_SECTIONS } from '@/lib/builder-sections'
import { SectionRenderer } from '@/components/storefront/sections/section-renderer'
import { CartDrawer } from '@/components/storefront/cart-drawer'
import type { SectionProps, Shop, Product, Category, ShopHours, AdvancedSettings } from '@/components/storefront/sections/types'
import { formatTime, formatMoney } from '@/components/storefront/sections/types'

interface StorefrontSection {
  id: string
  sectionType: string
  config: Record<string, unknown>
  isVisible: boolean
}

interface StorefrontProps {
  shop: Shop
  products: Product[]
  categories: Category[]
  hours: ShopHours[]
  sections?: StorefrontSection[]
  advanced?: AdvancedSettings | null
}

export function ShopStorefront({ shop, products, categories, hours, sections, advanced }: StorefrontProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)

  const primaryColor = shop.primary_color || '#4E6E52'
  const secondaryColor = shop.secondary_color || '#7A5C45'
  const accentColor = shop.accent_color || '#C66A3D'
  const bgColor = shop.background_color || '#F6EFE3'
  const textColor = shop.text_color || '#2F241D'
  const headingColor = shop.heading_color || '#261C16'
  const bodyFont = shop.font_body || '"DM Sans", "Segoe UI", sans-serif'
  const headingFont = shop.font_heading || '"Playfair Display", Georgia, serif'

  const theme = { primaryColor, secondaryColor, accentColor, bgColor, textColor, headingColor, bodyFont, headingFont, advanced: advanced || undefined }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = Object.entries(cart).reduce((total, [productId, qty]) => {
    const product = products.find((p) => p.id === productId)
    return total + (product ? product.price * qty : 0)
  }, 0)

  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev }
      if (!next[productId]) return next
      if (next[productId] > 1) {
        next[productId] -= 1
      } else {
        delete next[productId]
      }
      return next
    })
  }

  const clearCart = () => setCart({})

  const openNowLabel = useMemo(() => {
    if (!hours.length) return null
    const today = new Date().getDay()
    const row = hours.find((h) => h.day_of_week === today)
    if (!row || row.is_closed) return 'Closed today'
    return `Open today ${formatTime(row.open_time)} - ${formatTime(row.close_time)}`
  }, [hours])

  const activeSections = sections && sections.length > 0 ? sections : DEFAULT_SECTIONS

  const sectionProps: SectionProps = {
    shop,
    theme,
    config: {},
    products,
    categories,
    hours,
    cart,
    addToCart,
    removeFromCart,
    activeCategory,
    setActiveCategory,
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `radial-gradient(1400px 540px at 20% -5%, ${primaryColor}22, transparent 60%), radial-gradient(1000px 420px at 88% 0%, ${accentColor}22, transparent 58%), ${bgColor}`,
        color: textColor,
        fontFamily: bodyFont,
      }}
    >
      {/* Sticky navigation bar */}
      <div className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: `${textColor}1f`, backgroundColor: `${bgColor}e8` }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              {shop.name.charAt(0)}
            </div>
            <p className="text-sm font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
              {shop.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {cartCount > 0 ? (
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount} — {formatMoney(cartTotal)}
              </button>
            ) : (
              <p className="text-sm" style={{ color: `${textColor}99` }}>
                {openNowLabel || 'Fresh local goods'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic section content */}
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-6">
        <SectionRenderer sections={activeSections} sectionProps={sectionProps} />

        {/* Social links — always shown at bottom if available */}
        {(shop.instagram_url || shop.website_url) && (
          <div
            className="mt-10 rounded-2xl border p-5 text-center"
            style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
          >
            <h3 className="mb-3 text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
              Connect
            </h3>
            <div className="flex justify-center gap-3">
              {shop.instagram_url && (
                <Link href={shop.instagram_url} target="_blank" className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-slate-50" style={{ borderColor: `${textColor}22` }}>
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {shop.website_url && (
                <Link href={shop.website_url} target="_blank" className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-slate-50" style={{ borderColor: `${textColor}22` }}>
                  <ExternalLink className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating cart button (mobile/desktop) */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full px-6 py-3 text-white shadow-xl transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: primaryColor }}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="font-semibold">
            {cartCount} item{cartCount === 1 ? '' : 's'} — {formatMoney(cartTotal)}
          </span>
          <span className="rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: `${accentColor}bb` }}>
            {shop.order_button_text || 'View Cart'}
          </span>
        </button>
      )}

      {/* Cart Drawer with full checkout flow */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        shop={shop}
        theme={theme}
        products={products}
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
    </div>
  )
}
