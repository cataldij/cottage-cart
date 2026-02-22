// Section types and definitions for the Maker's Market storefront builder

export interface StorefrontSection {
  id: string
  sectionType: StorefrontSectionType
  config: Record<string, unknown>
  isVisible: boolean
}

export type StorefrontSectionType =
  | 'hero'
  | 'featured_products'
  | 'product_categories'
  | 'all_products'
  | 'about_me'
  | 'reviews'
  | 'pickup_details'
  | 'shop_hours'
  | 'faq'
  | 'instagram_feed'
  | 'newsletter_signup'
  | 'custom_text'
  | 'divider'
  | 'spacer'

export interface SectionDefinition {
  type: StorefrontSectionType
  name: string
  description: string
  icon: string
  category: 'content' | 'engagement' | 'layout' | 'custom'
  defaultConfig: Record<string, unknown>
  singleton?: boolean
}

export const MAKER_SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    type: 'hero',
    name: 'Hero Banner',
    description: 'Large header with shop name and image',
    icon: 'Image',
    category: 'content',
    defaultConfig: { height: 'medium', showTagline: true, showCTA: true },
    singleton: true,
  },
  {
    type: 'featured_products',
    name: 'Featured Products',
    description: 'Highlight your best sellers',
    icon: 'Star',
    category: 'content',
    defaultConfig: { count: 3, style: 'card' },
  },
  {
    type: 'product_categories',
    name: 'Product Categories',
    description: 'Browse by category tabs',
    icon: 'Grid3X3',
    category: 'content',
    defaultConfig: { showCounts: true },
  },
  {
    type: 'all_products',
    name: 'All Products',
    description: 'Full product catalog',
    icon: 'ShoppingBag',
    category: 'content',
    defaultConfig: { layout: 'grid', showFilters: true },
  },
  {
    type: 'about_me',
    name: 'About Me',
    description: 'Tell your maker story',
    icon: 'User',
    category: 'content',
    defaultConfig: { style: 'card' },
    singleton: true,
  },
  {
    type: 'reviews',
    name: 'Reviews',
    description: 'Customer testimonials',
    icon: 'MessageSquare',
    category: 'engagement',
    defaultConfig: { count: 3, style: 'carousel' },
  },
  {
    type: 'pickup_details',
    name: 'Pickup Details',
    description: 'Location and instructions',
    icon: 'MapPin',
    category: 'content',
    defaultConfig: { showMap: false },
    singleton: true,
  },
  {
    type: 'shop_hours',
    name: 'Shop Hours',
    description: 'Weekly schedule',
    icon: 'Clock',
    category: 'content',
    defaultConfig: {},
    singleton: true,
  },
  {
    type: 'faq',
    name: 'FAQ',
    description: 'Common questions and answers',
    icon: 'HelpCircle',
    category: 'engagement',
    defaultConfig: {
      items: [
        { q: 'How do I place an order?', a: 'Browse our products and add items to your cart. Choose a pickup time at checkout.' },
        { q: 'Do you offer delivery?', a: 'Currently we offer pickup only. Check back for delivery updates!' },
        { q: 'What allergens are in your products?', a: 'Each product listing includes allergen information. Please check before ordering.' },
      ],
    },
  },
  {
    type: 'instagram_feed',
    name: 'Instagram Feed',
    description: 'Show your latest posts',
    icon: 'Instagram',
    category: 'engagement',
    defaultConfig: { count: 6, handle: '' },
  },
  {
    type: 'newsletter_signup',
    name: 'Newsletter Signup',
    description: 'Collect customer emails',
    icon: 'Mail',
    category: 'engagement',
    defaultConfig: { headline: 'Stay in the loop', description: 'Get notified about new drops and specials', buttonText: 'Subscribe' },
  },
  {
    type: 'custom_text',
    name: 'Custom Text Block',
    description: 'Add any custom content',
    icon: 'Type',
    category: 'custom',
    defaultConfig: { heading: '', text: '' },
  },
  {
    type: 'divider',
    name: 'Divider',
    description: 'Visual separator line',
    icon: 'Minus',
    category: 'layout',
    defaultConfig: { style: 'line' },
  },
  {
    type: 'spacer',
    name: 'Spacer',
    description: 'Empty vertical space',
    icon: 'Square',
    category: 'layout',
    defaultConfig: { height: 'md' },
  },
]

export const DEFAULT_SECTIONS: StorefrontSection[] = [
  { id: 'default-hero', sectionType: 'hero', config: { height: 'medium', showTagline: true, showCTA: true }, isVisible: true },
  { id: 'default-featured', sectionType: 'featured_products', config: { count: 3, style: 'card' }, isVisible: true },
  { id: 'default-products', sectionType: 'all_products', config: { layout: 'grid', showFilters: true }, isVisible: true },
  { id: 'default-about', sectionType: 'about_me', config: { style: 'card' }, isVisible: true },
  { id: 'default-pickup', sectionType: 'pickup_details', config: { showMap: false }, isVisible: true },
  { id: 'default-hours', sectionType: 'shop_hours', config: {}, isVisible: true },
]

export function generateSectionId(): string {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getSectionDefinition(type: StorefrontSectionType): SectionDefinition | undefined {
  return MAKER_SECTION_DEFINITIONS.find(d => d.type === type)
}
