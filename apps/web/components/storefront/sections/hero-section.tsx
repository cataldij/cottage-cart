import Image from 'next/image'
import { MapPin, Star, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SectionProps, StorefrontTheme } from './types'
import { CATEGORY_LABELS } from './types'

export function HeroSection({ shop, theme }: SectionProps) {
  const { primaryColor, accentColor, textColor, headingColor, headingFont } = theme

  return (
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
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(24,18,15,0.65), rgba(24,18,15,0.25), rgba(24,18,15,0.05))' }}
        />
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
            <Button className="rounded-full px-5 text-white" style={{ backgroundColor: primaryColor }}>
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
  )
}
