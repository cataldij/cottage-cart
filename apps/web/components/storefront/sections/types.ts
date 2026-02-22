export interface AdvancedSettings {
  buttonShape?: 'rounded' | 'pill' | 'square'
  buttonSize?: 'sm' | 'md' | 'lg'
  sectionSpacing?: 'compact' | 'normal' | 'spacious'
  productCardStyle?: 'default' | 'grid' | 'compact'
  cornerRadius?: 'none' | 'subtle' | 'rounded' | 'pill'
}

export interface StorefrontTheme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  bgColor: string
  textColor: string
  headingColor: string
  bodyFont: string
  headingFont: string
  advanced?: AdvancedSettings
}

export function getButtonClasses(advanced?: AdvancedSettings) {
  const shape = advanced?.buttonShape || 'rounded'
  const size = advanced?.buttonSize || 'md'
  const radiusMap: Record<string, string> = { rounded: 'rounded-full', pill: 'rounded-full', square: 'rounded-md' }
  const sizeMap: Record<string, string> = { sm: 'px-3 py-1 text-xs', md: 'px-5 py-2 text-sm', lg: 'px-6 py-2.5 text-base' }
  return `${radiusMap[shape] || 'rounded-full'} ${sizeMap[size] || 'px-5 py-2 text-sm'}`
}

export function getSectionSpacingClass(advanced?: AdvancedSettings) {
  const spacing = advanced?.sectionSpacing || 'normal'
  const map: Record<string, string> = { compact: 'mt-6', normal: 'mt-10', spacious: 'mt-16' }
  return map[spacing] || 'mt-10'
}

export function getCornerRadiusClass(advanced?: AdvancedSettings) {
  const radius = advanced?.cornerRadius || 'rounded'
  const map: Record<string, string> = { none: 'rounded-none', subtle: 'rounded-lg', rounded: 'rounded-2xl', pill: 'rounded-[28px]' }
  return map[radius] || 'rounded-2xl'
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_featured: boolean
  allergens: string[] | null
  dietary_tags: string[] | null
  preparation_time: string | null
  category: { name: string } | null
}

export interface Category {
  id: string
  name: string
}

export interface ShopHours {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export interface Shop {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  category: string
  location_name: string | null
  location_address: string | null
  pickup_instructions: string | null
  delivery_available: boolean
  delivery_fee: number | null
  accepting_orders: boolean
  order_button_text: string | null
  logo_url: string | null
  banner_url: string | null
  hero_background_url: string | null
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  background_color: string | null
  text_color: string | null
  heading_color: string | null
  font_heading: string | null
  font_body: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  website_url: string | null
}

export interface SectionProps {
  shop: Shop
  theme: StorefrontTheme
  config: Record<string, unknown>
  products: Product[]
  categories: Category[]
  hours: ShopHours[]
  cart: Record<string, number>
  addToCart: (id: string) => void
  removeFromCart: (id: string) => void
  activeCategory: string | null
  setActiveCategory: (cat: string | null) => void
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const CATEGORY_LABELS: Record<string, string> = {
  bakery: 'Bakery',
  chocolatier: 'Chocolatier',
  hot_sauce: 'Hot Sauce',
  food_truck: 'Food Truck',
  jams_preserves: 'Jams & Preserves',
  specialty: 'Specialty Foods',
  other: 'Artisan Food',
}

export function formatTime(time: string | null) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}
