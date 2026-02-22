'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { SectionProps } from './types'
import { getSectionSpacingClass } from './types'

interface FAQItem {
  q: string
  a: string
}

export function FAQSection({ theme, config }: SectionProps) {
  const { primaryColor, textColor, headingColor, headingFont, advanced } = theme
  const items = (config.items as FAQItem[]) || []
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!items.length) return null

  return (
    <section className={getSectionSpacingClass(advanced)}>
      <h2 className="mb-4 text-2xl font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
          >
            <button
              className="flex w-full items-center justify-between p-4 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="text-sm font-semibold" style={{ color: headingColor }}>
                {item.q}
              </span>
              <ChevronDown
                className="h-4 w-4 shrink-0 transition-transform"
                style={{
                  color: primaryColor,
                  transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4">
                <p className="text-sm leading-relaxed" style={{ color: `${textColor}99` }}>
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
