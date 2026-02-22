import type { SectionProps } from './types'

export function AboutSection({ shop, theme }: SectionProps) {
  const { textColor, headingColor, headingFont } = theme

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}>
      <h3 className="text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>About This Shop</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: `${textColor}99` }}>
        {shop.description || 'Small-batch goods handcrafted with seasonal ingredients and neighborhood care.'}
      </p>
    </div>
  )
}
