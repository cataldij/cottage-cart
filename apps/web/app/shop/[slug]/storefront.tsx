'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ChefHat,
  Clock,
  MapPin,
  ShoppingBag,
  Star,
  Truck,
  Instagram,
  ExternalLink,
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

export function ShopStorefront({ shop, products, categories, hours }: StorefrontProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<Record<string, number>>({})

  const primaryColor = shop.primary_color || '#D97706'
  const bgColor = shop.background_color || '#FFFBF5'
  const textColor = shop.text_color || '#1F2937'
  const headingColor = shop.heading_color || '#111827'

  const featuredProducts = products.filter(p => p.is_featured)
  const filteredProducts = activeCategory
    ? products.filter(p => p.category?.name === activeCategory)
    : products

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = Object.entries(cart).reduce((total, [productId, qty]) => {
    const product = products.find(p => p.id === productId)
    return total + (product ? product.price * qty : 0)
  }, 0)

  const addToCart = (productId: string) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] > 1) {
        newCart[productId]--
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Hero */}
      <div
        className="relative flex min-h-[320px] items-end overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${shop.secondary_color || '#92400E'})` }}
      >
        {(shop.hero_background_url || shop.banner_url) && (
          <Image
            src={shop.hero_background_url || shop.banner_url || ''}
            alt={shop.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-8">
          <div className="flex items-end gap-4">
            {shop.logo_url && (
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                <Image src={shop.logo_url} alt="" width={80} height={80} className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                {CATEGORY_LABELS[shop.category] || shop.category}
              </span>
              <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                {shop.name}
              </h1>
              {shop.tagline && (
                <p className="mt-1 text-lg text-white/80">{shop.tagline}</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
            {shop.location_name && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {shop.location_name}
              </span>
            )}
            {shop.delivery_available && (
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4" /> Delivery available
              </span>
            )}
            {shop.accepting_orders && (
              <span className="flex items-center gap-1 text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-400" /> Accepting orders
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Featured items */}
        {featuredProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold" style={{ color: headingColor }}>
              <Star className="h-5 w-5" style={{ color: primaryColor }} />
              Featured
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map(product => (
                <div key={product.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  {product.image_url && (
                    <div className="relative h-40">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold" style={{ color: headingColor }}>{product.name}</h3>
                    {product.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ color: primaryColor }}>
                        ${product.price.toFixed(2)}
                      </span>
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
                    {product.dietary_tags && product.dietary_tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {product.dietary_tags.map(tag => (
                          <span key={tag} className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Menu */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold" style={{ color: headingColor }}>
              <ChefHat className="h-5 w-5" style={{ color: primaryColor }} />
              Menu
            </h2>
            {/* Category filter */}
            {categories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                    !activeCategory ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                  style={!activeCategory ? { backgroundColor: primaryColor } : {}}
                  onClick={() => setActiveCategory(null)}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                      activeCategory === cat.name ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                    style={activeCategory === cat.name ? { backgroundColor: primaryColor } : {}}
                    onClick={() => setActiveCategory(cat.name)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
            {/* Product list */}
            <div className="space-y-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
                  {product.image_url && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: headingColor }}>{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                    )}
                    {product.allergens && product.allergens.length > 0 && (
                      <p className="mt-1 text-[11px] text-orange-600">
                        Allergens: {product.allergens.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold" style={{ color: primaryColor }}>
                      ${product.price.toFixed(2)}
                    </span>
                    {shop.accepting_orders && (
                      cart[product.id] ? (
                        <div className="flex items-center gap-2">
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm font-bold"
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
                          variant="outline"
                          className="rounded-full text-xs"
                          onClick={() => addToCart(product.id)}
                        >
                          Add
                        </Button>
                      )
                    )}
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <p className="py-8 text-center text-gray-400">No items in this category yet.</p>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* About */}
            {shop.description && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="mb-2 font-semibold" style={{ color: headingColor }}>About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{shop.description}</p>
              </div>
            )}

            {/* Hours */}
            {hours.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 font-semibold" style={{ color: headingColor }}>
                  <Clock className="h-4 w-4" /> Hours
                </h3>
                <div className="space-y-1.5 text-sm">
                  {hours.map(h => (
                    <div key={h.day_of_week} className="flex justify-between">
                      <span className="text-gray-600">{DAY_NAMES[h.day_of_week]}</span>
                      <span className={h.is_closed ? 'text-gray-400' : 'font-medium'}>
                        {h.is_closed ? 'Closed' : `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pickup info */}
            {shop.pickup_instructions && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="mb-2 flex items-center gap-2 font-semibold" style={{ color: headingColor }}>
                  <MapPin className="h-4 w-4" /> Pickup Info
                </h3>
                <p className="text-sm text-gray-600">{shop.pickup_instructions}</p>
                {shop.location_address && (
                  <p className="mt-2 text-sm font-medium text-gray-700">{shop.location_address}</p>
                )}
              </div>
            )}

            {/* Social links */}
            <div className="flex gap-3">
              {shop.instagram_url && (
                <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {shop.website_url && (
                <a href={shop.website_url} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200">
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <button
            className="flex items-center gap-3 rounded-full px-6 py-3 text-white shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="font-semibold">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} &bull; ${cartTotal.toFixed(2)}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
              {shop.order_button_text || 'Pre-Order Now'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
