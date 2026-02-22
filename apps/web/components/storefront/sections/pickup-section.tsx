import { MapPin } from 'lucide-react'
import type { SectionProps } from './types'

export function PickupSection({ shop, theme }: SectionProps) {
  const { primaryColor, textColor, headingColor, headingFont } = theme

  if (!shop.pickup_instructions && !shop.location_address) return null

  return (
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
  )
}
