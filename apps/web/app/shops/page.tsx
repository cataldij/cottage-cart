import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Star } from 'lucide-react'

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
  title: 'Browse Shops | CottageCart',
  description: 'Discover local bakers and makers in your area.',
}

export default async function ShopsPage() {
  const shops = await getPublicShops()

  return (
    <main className="min-h-screen bg-[#F7F1E6] px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6E5D4E]">
            Maker&apos;s Market
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#261C16]">
            Browse Local Shops
          </h1>
          <p className="mt-2 text-sm text-[#6E5D4E]">
            Explore public storefronts from bakers, preserve makers, and cottage food sellers.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/shop/demo"
            className="overflow-hidden rounded-3xl border border-[#d8c7b2] bg-[#fff9ef] shadow-[0_18px_36px_-28px_rgba(30,22,15,0.75)] transition-transform hover:-translate-y-0.5"
          >
            <div className="relative h-44">
              <Image
                src="https://images.pexels.com/photos/2280545/pexels-photo-2280545.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Demo shop"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#4E6E52]">Demo Shop</p>
              <h2 className="mt-1 text-xl font-semibold text-[#261C16]">Lisa&apos;s Home Bakery</h2>
              <p className="mt-1 text-sm text-[#6E5D4E]">Small-batch bakes made fresh each week.</p>
              <div className="mt-3 flex items-center justify-between text-sm text-[#6E5D4E]">
                <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-[#C66A3D] text-[#C66A3D]" /> 4.9</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> Front Porch Pickup</span>
              </div>
            </div>
          </Link>

          {shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/shop/${shop.slug}`}
              className="overflow-hidden rounded-3xl border border-[#d8c7b2] bg-[#fff9ef] shadow-[0_18px_36px_-28px_rgba(30,22,15,0.75)] transition-transform hover:-translate-y-0.5"
            >
              <div className="relative h-44">
                <Image
                  src={shop.hero_background_url || shop.banner_url || 'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                  alt={shop.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#4E6E52]">{shop.category || 'Shop'}</p>
                <h2 className="mt-1 text-xl font-semibold text-[#261C16]">{shop.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-[#6E5D4E]">{shop.tagline || 'Local small-batch shop'}</p>
                {shop.location_name && (
                  <div className="mt-3 text-sm text-[#6E5D4E]">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {shop.location_name}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
