// Curated template presets for Maker's Market storefront builder
import type { StorefrontSection } from './builder-sections'

export interface BuilderTemplate {
  id: string
  name: string
  description: string
  vibe: string
  emoji: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textMuted: string
    heading: string
    border: string
  }
  fonts: { heading: string; body: string }
  cardStyle: { variant: 'white' | 'tinted' | 'glass'; border: string; iconStyle: string }
  heroSettings: { style: 'image' | 'gradient'; height: string; overlayOpacity: number }
  sections: StorefrontSection[]
  gradients: { hero: string; accent: string; card: string }
}

export const BUILDER_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'classic-bakery',
    name: 'Classic Bakery',
    description: 'Warm, traditional, timeless',
    vibe: 'Like a cozy neighborhood bakery',
    emoji: '🍞',
    colors: {
      primary: '#8B5E3C',
      secondary: '#D4A574',
      accent: '#C67B3C',
      background: '#FFF8F0',
      surface: '#FFFFFF',
      text: '#3D2B1F',
      textMuted: '#8B7355',
      heading: '#5C3D2E',
      border: '#E8D5C4',
    },
    fonts: { heading: 'Playfair Display', body: 'Lora' },
    cardStyle: { variant: 'white', border: 'none', iconStyle: 'solid' },
    heroSettings: { style: 'image', height: 'medium', overlayOpacity: 0.3 },
    gradients: {
      hero: 'linear-gradient(135deg, #8B5E3C 0%, #D4A574 100%)',
      accent: 'linear-gradient(135deg, #C67B3C 0%, #D4A574 100%)',
      card: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
    },
    sections: [
      { id: 'tpl-hero', sectionType: 'hero', config: { height: 'large', showTagline: true, showCTA: true }, isVisible: true },
      { id: 'tpl-featured', sectionType: 'featured_products', config: { count: 3, style: 'card' }, isVisible: true },
      { id: 'tpl-about', sectionType: 'about_me', config: { style: 'card' }, isVisible: true },
      { id: 'tpl-products', sectionType: 'all_products', config: { layout: 'grid', showFilters: true }, isVisible: true },
      { id: 'tpl-reviews', sectionType: 'reviews', config: { count: 3, style: 'carousel' }, isVisible: true },
      { id: 'tpl-pickup', sectionType: 'pickup_details', config: { showMap: false }, isVisible: true },
      { id: 'tpl-hours', sectionType: 'shop_hours', config: {}, isVisible: true },
    ],
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, sharp, contemporary',
    vibe: 'Sleek and sophisticated',
    emoji: '✨',
    colors: {
      primary: '#1A1A1A',
      secondary: '#555555',
      accent: '#FF6B35',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#1A1A1A',
      textMuted: '#888888',
      heading: '#000000',
      border: '#EEEEEE',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    cardStyle: { variant: 'white', border: 'primary', iconStyle: 'outline' },
    heroSettings: { style: 'gradient', height: 'small', overlayOpacity: 0 },
    gradients: {
      hero: 'linear-gradient(135deg, #1A1A1A 0%, #333333 100%)',
      accent: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
      card: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
    },
    sections: [
      { id: 'tpl-hero', sectionType: 'hero', config: { height: 'small', showTagline: true, showCTA: true }, isVisible: true },
      { id: 'tpl-products', sectionType: 'all_products', config: { layout: 'grid', showFilters: true }, isVisible: true },
      { id: 'tpl-about', sectionType: 'about_me', config: { style: 'card' }, isVisible: true },
      { id: 'tpl-pickup', sectionType: 'pickup_details', config: { showMap: false }, isVisible: true },
    ],
  },
  {
    id: 'rustic-farmhouse',
    name: 'Rustic Farmhouse',
    description: 'Earthy, warm, handcrafted',
    vibe: 'Fresh from the farm stand',
    emoji: '🌾',
    colors: {
      primary: '#4E6E52',
      secondary: '#8B7355',
      accent: '#C4823D',
      background: '#F5F0E8',
      surface: '#FFFDF8',
      text: '#2D3B2E',
      textMuted: '#6B7C6D',
      heading: '#3A4F3C',
      border: '#D4CCBA',
    },
    fonts: { heading: 'Merriweather', body: 'Source Sans 3' },
    cardStyle: { variant: 'tinted', border: 'secondary', iconStyle: 'solid' },
    heroSettings: { style: 'image', height: 'large', overlayOpacity: 0.25 },
    gradients: {
      hero: 'linear-gradient(135deg, #4E6E52 0%, #7A9B7E 100%)',
      accent: 'linear-gradient(135deg, #C4823D 0%, #D4A574 100%)',
      card: 'linear-gradient(135deg, #F5F0E8 0%, #EDE5D8 100%)',
    },
    sections: [
      { id: 'tpl-hero', sectionType: 'hero', config: { height: 'large', showTagline: true, showCTA: true }, isVisible: true },
      { id: 'tpl-featured', sectionType: 'featured_products', config: { count: 4, style: 'card' }, isVisible: true },
      { id: 'tpl-about', sectionType: 'about_me', config: { style: 'card' }, isVisible: true },
      { id: 'tpl-categories', sectionType: 'product_categories', config: { showCounts: true }, isVisible: true },
      { id: 'tpl-products', sectionType: 'all_products', config: { layout: 'grid', showFilters: true }, isVisible: true },
      { id: 'tpl-reviews', sectionType: 'reviews', config: { count: 3, style: 'carousel' }, isVisible: true },
      { id: 'tpl-pickup', sectionType: 'pickup_details', config: { showMap: false }, isVisible: true },
      { id: 'tpl-hours', sectionType: 'shop_hours', config: {}, isVisible: true },
      { id: 'tpl-faq', sectionType: 'faq', config: { items: [] }, isVisible: true },
    ],
  },
  {
    id: 'bold-colorful',
    name: 'Bold & Colorful',
    description: 'Vibrant, energetic, fun',
    vibe: 'Bursting with personality',
    emoji: '🎨',
    colors: {
      primary: '#E63946',
      secondary: '#457B9D',
      accent: '#F4A261',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1D3557',
      textMuted: '#6C8EAD',
      heading: '#1D3557',
      border: '#DEE2E6',
    },
    fonts: { heading: 'Poppins', body: 'Nunito' },
    cardStyle: { variant: 'white', border: 'accent', iconStyle: 'pill' },
    heroSettings: { style: 'gradient', height: 'medium', overlayOpacity: 0 },
    gradients: {
      hero: 'linear-gradient(135deg, #E63946 0%, #F4A261 100%)',
      accent: 'linear-gradient(135deg, #457B9D 0%, #6BAED6 100%)',
      card: 'linear-gradient(135deg, #FFF5EE 0%, #FFF0E6 100%)',
    },
    sections: [
      { id: 'tpl-hero', sectionType: 'hero', config: { height: 'medium', showTagline: true, showCTA: true }, isVisible: true },
      { id: 'tpl-featured', sectionType: 'featured_products', config: { count: 4, style: 'card' }, isVisible: true },
      { id: 'tpl-categories', sectionType: 'product_categories', config: { showCounts: true }, isVisible: true },
      { id: 'tpl-products', sectionType: 'all_products', config: { layout: 'grid', showFilters: true }, isVisible: true },
      { id: 'tpl-newsletter', sectionType: 'newsletter_signup', config: { headline: 'Never miss a drop!', description: 'Be the first to know about new treats', buttonText: 'Count me in!' }, isVisible: true },
      { id: 'tpl-reviews', sectionType: 'reviews', config: { count: 3, style: 'carousel' }, isVisible: true },
      { id: 'tpl-pickup', sectionType: 'pickup_details', config: { showMap: false }, isVisible: true },
    ],
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined, luxurious, premium',
    vibe: 'For the discerning palate',
    emoji: '🥂',
    colors: {
      primary: '#2C3E50',
      secondary: '#8E7C68',
      accent: '#C9A96E',
      background: '#FAF9F7',
      surface: '#FFFFFF',
      text: '#2C3E50',
      textMuted: '#7F8C8D',
      heading: '#1A252F',
      border: '#E0DCD4',
    },
    fonts: { heading: 'Cormorant Garamond', body: 'Raleway' },
    cardStyle: { variant: 'white', border: 'none', iconStyle: 'outline' },
    heroSettings: { style: 'image', height: 'large', overlayOpacity: 0.4 },
    gradients: {
      hero: 'linear-gradient(135deg, #2C3E50 0%, #4A6274 100%)',
      accent: 'linear-gradient(135deg, #C9A96E 0%, #D4BC8E 100%)',
      card: 'linear-gradient(135deg, #FAF9F7 0%, #F2EFEA 100%)',
    },
    sections: [
      { id: 'tpl-hero', sectionType: 'hero', config: { height: 'large', showTagline: true, showCTA: true }, isVisible: true },
      { id: 'tpl-about', sectionType: 'about_me', config: { style: 'card' }, isVisible: true },
      { id: 'tpl-featured', sectionType: 'featured_products', config: { count: 3, style: 'card' }, isVisible: true },
      { id: 'tpl-divider', sectionType: 'divider', config: { style: 'line' }, isVisible: true },
      { id: 'tpl-products', sectionType: 'all_products', config: { layout: 'grid', showFilters: true }, isVisible: true },
      { id: 'tpl-reviews', sectionType: 'reviews', config: { count: 3, style: 'carousel' }, isVisible: true },
      { id: 'tpl-pickup', sectionType: 'pickup_details', config: { showMap: false }, isVisible: true },
      { id: 'tpl-hours', sectionType: 'shop_hours', config: {}, isVisible: true },
    ],
  },
  {
    id: 'fun-playful',
    name: 'Fun & Playful',
    description: 'Bright, cheerful, friendly',
    vibe: 'Sweet treats, good vibes',
    emoji: '🧁',
    colors: {
      primary: '#FF69B4',
      secondary: '#9B59B6',
      accent: '#FFD93D',
      background: '#FFFBF5',
      surface: '#FFFFFF',
      text: '#4A3548',
      textMuted: '#9B8A99',
      heading: '#C2185B',
      border: '#F0E0F0',
    },
    fonts: { heading: 'Quicksand', body: 'Nunito' },
    cardStyle: { variant: 'glass', border: 'accent', iconStyle: 'pill' },
    heroSettings: { style: 'gradient', height: 'medium', overlayOpacity: 0 },
    gradients: {
      hero: 'linear-gradient(135deg, #FF69B4 0%, #FFD93D 100%)',
      accent: 'linear-gradient(135deg, #9B59B6 0%, #C39BD3 100%)',
      card: 'linear-gradient(135deg, #FFF0F5 0%, #FFF5EE 100%)',
    },
    sections: [
      { id: 'tpl-hero', sectionType: 'hero', config: { height: 'medium', showTagline: true, showCTA: true }, isVisible: true },
      { id: 'tpl-featured', sectionType: 'featured_products', config: { count: 4, style: 'card' }, isVisible: true },
      { id: 'tpl-products', sectionType: 'all_products', config: { layout: 'grid', showFilters: true }, isVisible: true },
      { id: 'tpl-newsletter', sectionType: 'newsletter_signup', config: { headline: 'Join the sweet life!', description: 'Get updates on new treats and special orders', buttonText: 'Yes please!' }, isVisible: true },
      { id: 'tpl-reviews', sectionType: 'reviews', config: { count: 3, style: 'carousel' }, isVisible: true },
      { id: 'tpl-about', sectionType: 'about_me', config: { style: 'card' }, isVisible: true },
      { id: 'tpl-pickup', sectionType: 'pickup_details', config: { showMap: false }, isVisible: true },
      { id: 'tpl-faq', sectionType: 'faq', config: { items: [] }, isVisible: true },
    ],
  },
]
