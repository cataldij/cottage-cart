import type { SectionProps } from './types'
import { getSectionSpacingClass } from './types'

export function CustomTextSection({ theme, config }: SectionProps) {
  const { textColor, headingColor, headingFont, advanced } = theme
  const heading = (config.heading as string) || ''
  const text = (config.text as string) || ''

  if (!heading && !text) return null

  return (
    <section className={getSectionSpacingClass(advanced)}>
      {heading && (
        <h2 className="text-2xl font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
          {heading}
        </h2>
      )}
      {text && (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: `${textColor}99` }}>
          {text}
        </p>
      )}
    </section>
  )
}
