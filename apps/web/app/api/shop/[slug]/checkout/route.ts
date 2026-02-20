import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CheckoutItem {
  productId: string
  quantity: number
}

interface CheckoutBody {
  items?: CheckoutItem[]
  notes?: string
  pickupDate?: string | null
  pickupTime?: string | null
  isDelivery?: boolean
  deliveryAddress?: string | null
  customerName?: string | null
  customerPhone?: string | null
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Please sign in to place an order.' }, { status: 401 })
  }

  const body = (await req.json()) as CheckoutBody
  const items = (body.items || [])
    .filter((item) => item?.productId && Number(item.quantity) > 0)
    .map((item) => ({
      productId: item.productId,
      quantity: Math.min(99, Math.max(1, Number(item.quantity))),
    }))

  if (items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 })
  }

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('id, slug, name, accepting_orders, delivery_fee')
    .eq('slug', params.slug)
    .eq('is_public', true)
    .single()

  if (shopError || !shop) {
    return NextResponse.json({ error: 'Shop not found.' }, { status: 404 })
  }

  if (!shop.accepting_orders) {
    return NextResponse.json({ error: 'This shop is not accepting orders right now.' }, { status: 400 })
  }

  const productIds = items.map((item) => item.productId)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, is_available')
    .eq('shop_id', shop.id)
    .in('id', productIds)

  if (productsError || !products) {
    return NextResponse.json({ error: 'Could not load products.' }, { status: 500 })
  }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const orderItems = []
  let subtotal = 0

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product || !product.is_available) {
      return NextResponse.json({ error: 'One or more items are unavailable.' }, { status: 400 })
    }

    const unitPrice = Number(product.price || 0)
    const totalPrice = unitPrice * item.quantity
    subtotal += totalPrice
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    })
  }

  if (subtotal <= 0) {
    return NextResponse.json({ error: 'Order total must be greater than zero.' }, { status: 400 })
  }

  const deliveryFee = body.isDelivery ? Number(shop.delivery_fee || 0) : 0
  const total = subtotal + deliveryFee
  const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer'

  const { data: order, error: orderError } = await supabase
    .from('shop_orders')
    .insert({
      shop_id: shop.id,
      customer_id: user.id,
      customer_name: body.customerName?.trim() || fallbackName,
      customer_email: user.email || '',
      customer_phone: body.customerPhone?.trim() || null,
      status: 'pending',
      pickup_date: body.pickupDate || null,
      pickup_time: body.pickupTime || null,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      notes: body.notes?.trim() || null,
      is_delivery: !!body.isDelivery,
      delivery_address: body.isDelivery ? body.deliveryAddress?.trim() || null : null,
    })
    .select('id, total, status, created_at')
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message || 'Could not create order.' }, { status: 500 })
  }

  const { error: itemsError } = await supabase
    .from('shop_order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })))

  if (itemsError) {
    await supabase.from('shop_orders').delete().eq('id', order.id)
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    order,
  })
}
