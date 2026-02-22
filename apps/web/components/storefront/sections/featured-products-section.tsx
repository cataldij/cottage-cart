import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { SectionProps } from './types'
import { formatMoney, getButtonClasses, getSectionSpacingClass, getCornerRadiusClass } from './types'

export function FeaturedProductsSection({ shop, theme, products, addToCart, config }: SectionProps) {
  const { primaryColor, accentColor, textColor, headingColor, headingFont, advanced } = theme
  const maxCount = (config.count as number) || 3
  const featuredProducts = products.filter((p) => p.is_featured).slice(0, maxCount)
  const btnClass = getButtonClasses(advanced)
  const spacingClass = getSectionSpacingClass(advanced)
  const radiusClass = getCornerRadiusClass(advanced)

  if (featuredProducts.length === 0) return null

  return (
    <section className={spacingClass}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
          Baked This Week
        </h2>
        <p className="text-sm" style={{ color: `${textColor}99` }}>Fresh, limited, and made in small batches</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featuredProducts.map((product) => (
          <article
            key={product.id}
            className={`overflow-hidden ${radiusClass} border shadow-[0_18px_40px_-34px_rgba(20,16,12,0.95)] transition-transform hover:-translate-y-0.5`}
            style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
          >
            <div className="relative h-44">
              <Image
                src={product.image_url || 'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
                Featured
              </p>
              <h3 className="mt-1 text-lg font-semibold" style={{ color: headingColor, fontFamily: headingFont }}>
                {product.name}
              </h3>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-sm" style={{ color: `${textColor}99` }}>
                  {product.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-bold" style={{ color: primaryColor }}>
                  {formatMoney(product.price)}
                </p>
                {shop.accepting_orders && (
                  <button
                    className={`${btnClass} font-semibold text-white`}
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => addToCart(product.id)}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
