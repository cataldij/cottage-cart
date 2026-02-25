import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Star, ChefHat, UtensilsCrossed, Cookie, Beef, Coffee, Dog, Package } from 'lucide-react'

interface PublicShop {
  id: string
  name: string
  slug: string
  tagline: string | null
  category: string
  location_name: string | null
  banner_url: string | null
  hero_background_url: string | null
}

const CATEGORIES = [
  { value: 'all', label: 'All Shops', icon: Package },
  { value: 'bakery', label: 'Bakery', icon: Cookie },
  { value: 'preserves', label: 'Preserves', icon: UtensilsCrossed },
  { value: 'sauces', label: 'Sauces', icon: Beef },
  { value: 'snacks', label: 'Snacks', icon: ChefHat },
  { value: 'beverages', label: 'Drinks', icon: Coffee },
  { value: 'pet_treats', label: 'Pet Treats', icon: Dog },
]

async function getPublicShops(): Promise<PublicShop[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('shops')
    .select('id, name, slug, tagline, category, location_name, banner_url, hero_background_url')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return data || []
}

export const metadata = {
  title: "Browse Shops | Maker's Market",
  description: 'Discover local bakers and makers selling homemade goods in your area.',
}

export default async function ShopsPage() {
  const shops = await getPublicShops()

  return (
    <main className="min-h-screen bg-[#F7F1E6]">
      {/* Hero / Header */}
      <section className="relative overflow-hidden border-b border-[#d8c7b2] bg-gradient-to-b from-[#fff9ef] to-[#F7F1E6] px-6 py-12">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.15),_transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.12),_transparent_70%)]" />

        <div className="relative mx-auto w-full max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 text-white shadow-md">
              <span className="text-lg font-bold">M</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6E5D4E]">
                Maker&apos;s Market
              </p>
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-bold text-[#261C16] md:text-5xl">
            Discover Local Makers
          </h1>
          <p className="mt-3 max-w-xl text-[#6E5D4E]">
            Browse homemade goods from cottage food sellers, bakers, and artisan makers in your area.
          </p>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <span
                key={cat.value}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#d8c7b2] bg-[#fff9ef] px-3 py-1.5 text-xs font-medium text-[#6E5D4E] transition hover:border-amber-400 hover:bg-amber-50"
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center gap-6 text-sm text-[#6E5D4E]">
            <span><span className="font-semibold text-[#261C16]">{shops.length + 1}</span> shops listed</span>
            <span className="h-1 w-1 rounded-full bg-[#d8c7b2]" />
            <span><span className="font-semibold text-[#261C16]">{CATEGORIES.length - 1}</span> categories</span>
          </div>
        </div>
      </section>

      {/* Shop Grid */}
      <section className="px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Demo shop */}
            <Link
              href="/shop/demo"
              className="group overflow-hidden rounded-3xl border border-[#d8c7b2] bg-[#fff9ef] shadow-[0_18px_36px_-28px_rgba(30,22,15,0.75)] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/2280545/pexels-photo-2280545.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Demo shop"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 backdrop-blur-sm">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#4E6E52]">Demo Shop</p>
                <h2 className="mt-1 text-xl font-semibold text-[#261C16]">Lisa&apos;s Home Bakery</h2>
                <p className="mt-1 text-sm text-[#6E5D4E]">Small-batch bakes made fresh each week.</p>
                <div className="mt-3 flex items-center justify-between text-sm text-[#6E5D4E]">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#C66A3D] text-[#C66A3D]" /> 4.9
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Front Porch Pickup
                  </span>
                </div>
              </div>
            </Link>

            {/* Real shops */}
            {shops.map((shop) => {
              const catInfo = CATEGORIES.find(c => c.value === shop.category)
              const CatIcon = catInfo?.icon || Package

              return (
                <Link
                  key={shop.id}
                  href={`/shop/${shop.slug}`}
                  className="group overflow-hidden rounded-3xl border border-[#d8c7b2] bg-[#fff9ef] shadow-[0_18px_36px_-28px_rgba(30,22,15,0.75)] transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={shop.hero_background_url || shop.banner_url || 'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                      alt={shop.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5">
                      <CatIcon className="h-3.5 w-3.5 text-[#4E6E52]" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#4E6E52]">
                        {catInfo?.label || shop.category || 'Shop'}
                      </p>
                    </div>
                    <h2 className="mt-1 text-xl font-semibold text-[#261C16]">{shop.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-[#6E5D4E]">
                      {shop.tagline || 'Local small-batch shop'}
                    </p>
                    {shop.location_name && (
                      <div className="mt-3 text-sm text-[#6E5D4E]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {shop.location_name}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Empty state */}
          {shops.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-[#6E5D4E]">More shops coming soon! Check back later.</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-3xl border border-[#d8c7b2] bg-gradient-to-br from-[#fff9ef] to-[#fef3cd] p-8 text-center">
            <ChefHat className="mx-auto h-10 w-10 text-amber-600" />
            <h2 className="mt-3 text-2xl font-bold text-[#261C16]">Start Selling Your Homemade Goods</h2>
            <p className="mt-2 text-sm text-[#6E5D4E]">
              Join Maker&apos;s Market and reach customers in your area. Free to set up.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-amber-700 hover:to-orange-700"
            >
              Create Your Shop
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
