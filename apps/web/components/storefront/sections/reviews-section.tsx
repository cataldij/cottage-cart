import { Star } from 'lucide-react'
import type { SectionProps } from './types'
import { getSectionSpacingClass } from './types'

const DEMO_REVIEWS = [
  { id: '1', name: 'Sarah M.', rating: 5, text: 'The sourdough is incredible — best I have ever had outside of San Francisco!', date: '2 weeks ago' },
  { id: '2', name: 'James K.', rating: 5, text: 'Amazing muffins, fresh every time. My kids love them.', date: '1 month ago' },
  { id: '3', name: 'Lisa T.', rating: 4, text: 'Great variety and always on time for pickup. Highly recommend!', date: '1 month ago' },
]

export function ReviewsSection({ theme }: SectionProps) {
  const { primaryColor, accentColor, textColor, headingColor, headingFont, advanced } = theme

  return (
    <section className={getSectionSpacingClass(advanced)}>
      <h2 className="mb-4 text-2xl font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
        What Customers Say
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border p-5"
            style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4" fill={accentColor} color={accentColor} />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${textColor}cc` }}>
              &ldquo;{review.text}&rdquo;
            </p>
            <div className="mt-3 flex items-center justify-between text-xs" style={{ color: `${textColor}88` }}>
              <span className="font-semibold" style={{ color: primaryColor }}>{review.name}</span>
              <span>{review.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
