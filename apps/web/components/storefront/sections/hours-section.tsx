import { Clock } from 'lucide-react'
import type { SectionProps } from './types'
import { DAY_NAMES, formatTime } from './types'

export function HoursSection({ theme, hours }: SectionProps) {
  const { primaryColor, textColor, headingColor, headingFont } = theme

  if (!hours.length) return null

  return (
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
  )
}
