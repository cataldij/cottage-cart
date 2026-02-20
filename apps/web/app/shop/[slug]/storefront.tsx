'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Clock,
  ExternalLink,
  Instagram,
  MapPin,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_featured: boolean
  allergens: string[] | null
  dietary_tags: string[] | null
  preparation_time: string | null
  category: { name: string } | null
}

interface Category {
  id: string
  name: string
}

interface ShopHours {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

interface Shop {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  category: string
  location_name: string | null
  location_address: string | null
  pickup_instructions: string | null
  delivery_available: boolean
  delivery_fee: number | null
  accepting_orders: boolean
  order_button_text: string | null
  logo_url: string | null
  banner_url: string | null
  hero_background_url: string | null
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  background_color: string | null
  text_color: string | null
  heading_color: string | null
  font_heading: string | null
  font_body: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  website_url: string | null
}

interface StorefrontProps {
  shop: Shop
  products: Product[]
  categories: Category[]
  hours: ShopHours[]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const CATEGORY_LABELS: Record<string, string> = {
  bakery: 'Bakery',
  chocolatier: 'Chocolatier',
  hot_sauce: 'Hot Sauce',
  food_truck: 'Food Truck',
  jams_preserves: 'Jams & Preserves',
  specialty: 'Specialty Foods',
  other: 'Artisan Food',
}

function formatTime(time: string | null) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

export function ShopStorefront({ shop, products, categories, hours }: StorefrontProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  const primaryColor = shop.primary_color || '#4E6E52'
  const secondaryColor = shop.secondary_color || '#7A5C45'
  const accentColor = shop.accent_color || '#C66A3D'
  const bgColor = shop.background_color || '#F6EFE3'
  const textColor = shop.text_color || '#2F241D'
  const headingColor = shop.heading_color || '#261C16'
  const bodyFont = shop.font_body || '"DM Sans", "Segoe UI", sans-serif'
  const headingFont = shop.font_heading || '"Playfair Display", Georgia, serif'

  const featuredProducts = products.filter((p) => p.is_featured)
  const filteredProducts = activeCategory
    ? products.filter((p) => p.category?.name === activeCategory)
    : products

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

  const submitOrder = async () => {
    if (!cartCount || isSubmittingOrder) return
    if (shop.slug === 'demo') {
      setCheckoutMessage('Demo storefront checkout is preview-only. Publish your shop to accept orders.')
      return
    }

    const items = Object.entries(cart).map(([productId, quantity]) => ({
      productId,
      quantity,
    }))

    try {
      setIsSubmittingOrder(true)
      setCheckoutMessage(null)

      const response = await fetch(`/api/shop/${shop.slug}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      if (response.status === 401) {
        setCheckoutMessage('Please sign in to place your order.')
        return
      }

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setCheckoutMessage(data.error || 'Could not place order right now.')
        return
      }

      setCart({})
      setCheckoutMessage(`Order placed successfully (${data.order?.id?.slice(0, 8) || 'new order'}).`)
    } catch {
      setCheckoutMessage('Network error. Please try again.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const openNowLabel = useMemo(() => {
    if (!hours.length) return null
    const today = new Date().getDay()
    const row = hours.find((h) => h.day_of_week === today)
    if (!row || row.is_closed) return 'Closed today'
    return `Open today ${formatTime(row.open_time)} - ${formatTime(row.close_time)}`
  }, [hours])

  return (
    <div
      className="min-h-screen"
      style={{
        background: `radial-gradient(1400px 540px at 20% -5%, ${primaryColor}22, transparent 60%), radial-gradient(1000px 420px at 88% 0%, ${accentColor}22, transparent 58%), ${bgColor}`,
        color: textColor,
        fontFamily: bodyFont,
      }}
    >
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
          {cartCount > 0 ? (
            <p className="text-sm font-semibold" style={{ color: primaryColor }}>
              {cartCount} item{cartCount > 1 ? 's' : ''} - {formatMoney(cartTotal)}
            </p>
          ) : (
            <p className="text-sm" style={{ color: `${textColor}99` }}>
              {openNowLabel || 'Fresh local goods'}
            </p>
          )}
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-6">
        <section
          className="relative overflow-hidden rounded-[28px] border shadow-[0_40px_90px_-70px_rgba(40,30,20,0.85)]"
          style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
        >
          <div className="relative h-[320px] w-full">
            <Image
              src={shop.hero_background_url || shop.banner_url || 'https://images.pexels.com/photos/2280545/pexels-photo-2280545.jpeg?auto=compress&cs=tinysrgb&w=1600'}
              alt={shop.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(24,18,15,0.65), rgba(24,18,15,0.25), rgba(24,18,15,0.05))` }} />
          </div>

          <div className="relative -mt-14 px-6 pb-6">
            <div
              className="rounded-3xl border p-5 shadow-[0_20px_40px_-28px_rgba(20,16,12,0.6)] backdrop-blur"
              style={{ borderColor: `${textColor}22`, backgroundColor: 'rgba(255, 249, 237, 0.95)' }}
            >
              <div className="flex flex-wrap items-end gap-4">
                {shop.logo_url && (
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: `${textColor}22` }}>
                    <Image src={shop.logo_url} alt="" width={64} height={64} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ backgroundColor: `${primaryColor}22`, color: primaryColor }}
                  >
                    {CATEGORY_LABELS[shop.category] || shop.category}
                  </span>
                  <h1 className="mt-2 text-4xl font-semibold leading-tight" style={{ color: headingColor, fontFamily: headingFont }}>
                    {shop.name}
                  </h1>
                  {shop.tagline && <p className="mt-1 text-base" style={{ color: `${textColor}b0` }}>{shop.tagline}</p>}
                </div>
                <Button
                  className="rounded-full px-5 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Follow
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm" style={{ color: `${textColor}aa` }}>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4" fill={accentColor} color={accentColor} />
                  4.9 - 221 reviews
                </span>
                {shop.location_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" style={{ color: primaryColor }} />
                    {shop.location_name}
                  </span>
                )}
                {shop.delivery_available && (
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="h-4 w-4" style={{ color: primaryColor }} />
                    Delivery available
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
                Baked This Week
              </h2>
              <p className="text-sm" style={{ color: `${textColor}99` }}>Fresh, limited, and made in small batches</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border shadow-[0_18px_40px_-34px_rgba(20,16,12,0.95)] transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
                >
                  <div className="relative h-44">
                    <Image
                      src={product.image_url || 'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
                      Featured
                    </p>
                    <h3 className="mt-1 text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 line-clamp-2 text-sm" style={{ color: `${textColor}99` }}>
                        {product.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-bold" style={{ color: primaryColor }}>
                        {formatMoney(product.price)}
                      </p>
                      {shop.accepting_orders && (
                        <Button
                          size="sm"
                          className="rounded-full text-white"
                          style={{ backgroundColor: primaryColor }}
                          onClick={() => addToCart(product.id)}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                className={cn('rounded-full border px-4 py-1.5 text-sm font-semibold transition', !activeCategory && 'text-white')}
                style={{
                  borderColor: `${textColor}22`,
                  backgroundColor: !activeCategory ? primaryColor : '#fff9ef',
                  color: !activeCategory ? '#fff' : textColor,
                }}
                onClick={() => setActiveCategory(null)}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={cn('rounded-full border px-4 py-1.5 text-sm font-semibold transition')}
                  style={{
                    borderColor: `${textColor}22`,
                    backgroundColor: activeCategory === cat.name ? `${primaryColor}20` : '#fff9ef',
                    color: activeCategory === cat.name ? primaryColor : textColor,
                  }}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="flex gap-4 rounded-2xl border p-4 shadow-[0_14px_32px_-28px_rgba(20,16,12,0.8)]"
                  style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: `${textColor}18` }}>
                    <Image
                      src={product.image_url || 'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=500'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold leading-tight" style={{ color: headingColor, fontFamily: headingFont }}>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-sm" style={{ color: `${textColor}9d` }}>
                        {product.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {product.dietary_tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}>
                          {tag}
                        </span>
                      ))}
                      {product.allergens?.length ? (
                        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700">
                          Allergens: {product.allergens.join(', ')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex min-w-[88px] flex-col items-end justify-between">
                    <p className="text-lg font-bold" style={{ color: primaryColor }}>{formatMoney(product.price)}</p>
                    {shop.accepting_orders && (
                      cart[product.id] ? (
                        <div className="flex items-center gap-2">
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold"
                            style={{ borderColor: `${textColor}30` }}
                            onClick={() => removeFromCart(product.id)}
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold">{cart[product.id]}</span>
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: primaryColor }}
                            onClick={() => addToCart(product.id)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="rounded-full text-white"
                          style={{ backgroundColor: primaryColor }}
                          onClick={() => addToCart(product.id)}
                        >
                          Add
                        </Button>
                      )
                    )}
                  </div>
                </article>
              ))}

              {!filteredProducts.length && (
                <div className="rounded-2xl border p-10 text-center" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}>
                  <p style={{ color: `${textColor}90` }}>No products in this category yet.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border p-5" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}>
              <h3 className="text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>About This Shop</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: `${textColor}99` }}>
                {shop.description || 'Small-batch goods handcrafted with seasonal ingredients and neighborhood care.'}
              </p>
            </div>

            {hours.length > 0 && (
              <div className="rounded-2xl border p-5" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
                  <Clock className="h-4 w-4" style={{ color: primaryColor }} />
                  Pickup Hours
                </h3>
                <div className="space-y-1.5 text-sm">
                  {hours.map((h) => (
                    <div key={h.day_of_week} className="flex justify-between">
                      <span style={{ color: `${textColor}96` }}>{DAY_NAMES[h.day_of_week]}</span>
                      <span className={h.is_closed ? 'opacity-60' : 'font-medium'}>
                        {h.is_closed ? 'Closed' : `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(shop.pickup_instructions || shop.location_address) && (
              <div className="rounded-2xl border p-5" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}>
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
                  <MapPin className="h-4 w-4" style={{ color: primaryColor }} />
                  Pickup Details
                </h3>
                {shop.pickup_instructions && <p className="text-sm" style={{ color: `${textColor}9c` }}>{shop.pickup_instructions}</p>}
                {shop.location_address && (
                  <p className="mt-2 text-sm font-semibold" style={{ color: `${textColor}be` }}>
                    {shop.location_address}
                  </p>
                )}
              </div>
            )}

            {(shop.instagram_url || shop.website_url) && (
              <div className="rounded-2xl border p-5" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}>
                <h3 className="mb-3 text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
                  Connect
                </h3>
                <div className="flex gap-2">
                  {shop.instagram_url && (
                    <Link href={shop.instagram_url} target="_blank" className="inline-flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: `${textColor}22` }}>
                      <Instagram className="h-5 w-5" />
                    </Link>
                  )}
                  {shop.website_url && (
                    <Link href={shop.website_url} target="_blank" className="inline-flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: `${textColor}22` }}>
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>

      {cartCount > 0 && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 space-y-2">
          {checkoutMessage && (
            <div
              className="mx-auto w-fit rounded-full border px-4 py-2 text-xs font-semibold"
              style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef', color: textColor }}
            >
              {checkoutMessage}
            </div>
          )}
          <button
            className="flex items-center gap-3 rounded-full px-6 py-3 text-white shadow-xl transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: primaryColor }}
            onClick={submitOrder}
            disabled={isSubmittingOrder}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="font-semibold">
              {isSubmittingOrder
                ? 'Placing order...'
                : `${cartCount} item${cartCount === 1 ? '' : 's'} - ${formatMoney(cartTotal)}`}
            </span>
            <span className="rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: `${accentColor}bb` }}>
              {isSubmittingOrder ? 'Please wait' : (shop.order_button_text || 'Pre-Order')}
            </span>
          </button>
          {checkoutMessage === 'Please sign in to place your order.' && (
            <div className="text-center text-xs">
              <Link href="/login" className="font-semibold underline" style={{ color: primaryColor }}>
                Sign in to continue
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

