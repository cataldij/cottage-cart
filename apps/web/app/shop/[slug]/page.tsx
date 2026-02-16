import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ShopStorefront } from './storefront'

interface Props {
  params: { slug: string }
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
  const shop = await getShop(params.slug)
  if (!shop) return { title: 'Shop Not Found' }

  return {
    title: `${shop.name} | CottageCart`,
    description: shop.tagline || shop.description || `Order from ${shop.name} on CottageCart`,
  }
}

export default async function ShopPage({ params }: Props) {
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
