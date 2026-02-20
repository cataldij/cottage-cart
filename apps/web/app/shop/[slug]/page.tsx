import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ShopStorefront } from './storefront'

interface Props {
  params: { slug: string }
}

function getDemoStorefrontData() {
  const shop = {
    id: 'demo-shop',
    name: "Lisa's Home Bakery",
    slug: 'demo',
    tagline: 'Small-batch bakes made fresh each week.',
    description:
      'We are a neighborhood micro-bakery focused on slow-fermented bread, seasonal pastries, and porch pickup.',
    category: 'bakery',
    location_name: 'Front Porch Pickup',
    location_address: '123 Maple St, Hometown, USA',
    pickup_instructions: 'Please bring your order number and arrive during your pickup window.',
    delivery_available: true,
    delivery_fee: 3,
    accepting_orders: true,
    order_button_text: 'Pre-Order',
    logo_url: null,
    banner_url: 'https://images.pexels.com/photos/2280545/pexels-photo-2280545.jpeg?auto=compress&cs=tinysrgb&w=1200',
    hero_background_url:
      'https://images.pexels.com/photos/2280545/pexels-photo-2280545.jpeg?auto=compress&cs=tinysrgb&w=1600',
    primary_color: '#4E6E52',
    secondary_color: '#7A5C45',
    accent_color: '#C66A3D',
    background_color: '#F6EFE3',
    text_color: '#2F241D',
    heading_color: '#261C16',
    font_heading: 'Playfair Display',
    font_body: 'DM Sans',
    instagram_url: 'https://instagram.com',
    facebook_url: null,
    tiktok_url: null,
    website_url: null,
  }

  const categories = [
    { id: 'cat-breads', name: 'Breads' },
    { id: 'cat-pastries', name: 'Pastries' },
    { id: 'cat-seasonal', name: 'Seasonal' },
  ]

  const products = [
    {
      id: 'prod-1',
      name: 'Country Sourdough',
      description: 'Long-fermented loaf with a crisp crust.',
      price: 10,
      image_url: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800',
      is_featured: true,
      allergens: ['Wheat'],
      dietary_tags: ['Vegetarian'],
      preparation_time: null,
      category: { name: 'Breads' },
    },
    {
      id: 'prod-2',
      name: 'Blueberry Muffin Box',
      description: 'Six bakery-style muffins made with local berries.',
      price: 15,
      image_url: 'https://images.pexels.com/photos/1657343/pexels-photo-1657343.jpeg?auto=compress&cs=tinysrgb&w=800',
      is_featured: true,
      allergens: ['Wheat', 'Egg', 'Milk'],
      dietary_tags: [],
      preparation_time: null,
      category: { name: 'Pastries' },
    },
    {
      id: 'prod-3',
      name: 'Apple Cider Donuts',
      description: 'Cinnamon sugar donuts, sold by the half-dozen.',
      price: 8,
      image_url: 'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=800',
      is_featured: false,
      allergens: ['Wheat', 'Egg', 'Milk'],
      dietary_tags: [],
      preparation_time: null,
      category: { name: 'Seasonal' },
    },
  ]

  const hours = [
    { day_of_week: 0, open_time: null, close_time: null, is_closed: true },
    { day_of_week: 1, open_time: '09:00:00', close_time: '14:00:00', is_closed: false },
    { day_of_week: 2, open_time: '09:00:00', close_time: '14:00:00', is_closed: false },
    { day_of_week: 3, open_time: '09:00:00', close_time: '14:00:00', is_closed: false },
    { day_of_week: 4, open_time: '09:00:00', close_time: '14:00:00', is_closed: false },
    { day_of_week: 5, open_time: '09:00:00', close_time: '15:00:00', is_closed: false },
    { day_of_week: 6, open_time: '09:00:00', close_time: '15:00:00', is_closed: false },
  ]

  return { shop, products, categories, hours }
}

async function getShop(slug: string) {
  const supabase = await createClient()
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()
  return shop
}

async function getProducts(shopId: string) {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, category:product_categories(name)')
    .eq('shop_id', shopId)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
  return products || []
}

async function getCategories(shopId: string) {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('product_categories')
    .select('*')
    .eq('shop_id', shopId)
    .order('sort_order', { ascending: true })
  return categories || []
}

async function getHours(shopId: string) {
  const supabase = await createClient()
  const { data: hours } = await supabase
    .from('shop_hours')
    .select('*')
    .eq('shop_id', shopId)
    .order('day_of_week', { ascending: true })
  return hours || []
}

export async function generateMetadata({ params }: Props) {
  if (params.slug === 'demo') {
    const { shop } = getDemoStorefrontData()
    return {
      title: `${shop.name} | CottageCart`,
      description: shop.tagline || shop.description || `Order from ${shop.name} on CottageCart`,
    }
  }

  const shop = await getShop(params.slug)
  if (!shop) return { title: 'Shop Not Found' }

  return {
    title: `${shop.name} | CottageCart`,
    description: shop.tagline || shop.description || `Order from ${shop.name} on CottageCart`,
  }
}

export default async function ShopPage({ params }: Props) {
  if (params.slug === 'demo') {
    const demoData = getDemoStorefrontData()
    return (
      <ShopStorefront
        shop={demoData.shop}
        products={demoData.products}
        categories={demoData.categories}
        hours={demoData.hours}
      />
    )
  }

  const shop = await getShop(params.slug)
  if (!shop) notFound()

  const [products, categories, hours] = await Promise.all([
    getProducts(shop.id),
    getCategories(shop.id),
    getHours(shop.id),
  ])

  return (
    <ShopStorefront
      shop={shop}
      products={products}
      categories={categories}
      hours={hours}
    />
  )
}
