'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SectionProps } from './types'
import { getSectionSpacingClass, getButtonClasses } from './types'

export function NewsletterSection({ theme, config }: SectionProps) {
  const { primaryColor, textColor, headingColor, headingFont, advanced } = theme
  const headline = (config.headline as string) || 'Stay in the loop'
  const description = (config.description as string) || 'Get notified about new drops and specials'
  const buttonText = (config.buttonText as string) || 'Subscribe'
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section
      className={`${getSectionSpacingClass(advanced)} rounded-2xl border p-8 text-center`}
      style={{ borderColor: `${textColor}22`, backgroundColor: `${primaryColor}0a` }}
    >
      <Mail className="mx-auto h-8 w-8" style={{ color: primaryColor }} />
      <h2 className="mt-3 text-2xl font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
        {headline}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: `${textColor}99` }}>
        {description}
      </p>
      {submitted ? (
        <p className="mt-4 text-sm font-semibold" style={{ color: primaryColor }}>
          Thanks for subscribing!
        </p>
      ) : (
        <div className="mx-auto mt-4 flex max-w-sm gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
            style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
          />
          <Button
            className="rounded-full text-white"
            style={{ backgroundColor: primaryColor }}
            onClick={() => { if (email) setSubmitted(true) }}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </section>
  )
}
