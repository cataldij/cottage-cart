import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { SectionProps } from './types'
import { formatMoney, getButtonClasses, getSectionSpacingClass, getCornerRadiusClass } from './types'

export function AllProductsSection({
  shop, theme, products, categories, cart, addToCart, removeFromCart, activeCategory, setActiveCategory,
}: SectionProps) {
  const { primaryColor, textColor, headingColor, headingFont, advanced } = theme
  const btnClass = getButtonClasses(advanced)
  const spacingClass = getSectionSpacingClass(advanced)
  const radiusClass = getCornerRadiusClass(advanced)

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category?.name === activeCategory)
    : products

  return (
    <section className={spacingClass}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className={cn('rounded-full border px-4 py-1.5 text-sm font-semibold transition', !activeCategory && 'text-white')}
          style={{
            borderColor: `${textColor}22`,
            backgroundColor: !activeCategory ? primaryColor : '#fff9ef',
            color: !activeCategory ? '#fff' : textColor,
          }}
          onClick={() => setActiveCategory(null)}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={cn('rounded-full border px-4 py-1.5 text-sm font-semibold transition')}
            style={{
              borderColor: `${textColor}22`,
              backgroundColor: activeCategory === cat.name ? `${primaryColor}20` : '#fff9ef',
              color: activeCategory === cat.name ? primaryColor : textColor,
            }}
            onClick={() => setActiveCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <article
            key={product.id}
            className={`flex gap-4 ${radiusClass} border p-4 shadow-[0_14px_32px_-28px_rgba(20,16,12,0.8)]`}
            style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: `${textColor}18` }}>
              <Image
                src={product.image_url || 'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=500'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold leading-tight" style={{ color: headingColor, fontFamily: headingFont }}>
                {product.name}
              </h3>
              {product.description && (
                <p className="mt-1 text-sm" style={{ color: `${textColor}9d` }}>
                  {product.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.dietary_tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}>
                    {tag}
                  </span>
                ))}
                {product.allergens?.length ? (
                  <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700">
                    Allergens: {product.allergens.join(', ')}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex min-w-[88px] flex-col items-end justify-between">
              <p className="text-lg font-bold" style={{ color: primaryColor }}>{formatMoney(product.price)}</p>
              {shop.accepting_orders && (
                cart[product.id] ? (
                  <div className="flex items-center gap-2">
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold"
                      style={{ borderColor: `${textColor}30` }}
                      onClick={() => removeFromCart(product.id)}
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold">{cart[product.id]}</span>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => addToCart(product.id)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    className={`${btnClass} font-semibold text-white`}
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => addToCart(product.id)}
                  >
                    Add
                  </button>
                )
              )}
            </div>
          </article>
        ))}

        {!filteredProducts.length && (
          <div className="rounded-2xl border p-10 text-center" style={{ borderColor: `${textColor}22`, backgroundColor: '#fff9ef' }}>
            <p style={{ color: `${textColor}90` }}>No products in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
