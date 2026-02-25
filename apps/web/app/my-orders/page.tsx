import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ShoppingBag, Clock, CheckCircle, Package, XCircle, ArrowLeft, MapPin } from 'lucide-react'

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  shop_id: string
  status: string
  pickup_date: string | null
  pickup_time: string | null
  subtotal: number
  delivery_fee: number
  total: number
  notes: string | null
  is_delivery: boolean
  delivery_address: string | null
  created_at: string
  shops: { name: string; slug: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  ready: { label: 'Ready for Pickup', color: 'text-green-700', bg: 'bg-green-50', icon: Package },
  picked_up: { label: 'Picked Up', color: 'text-slate-500', bg: 'bg-slate-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
}

async function getMyOrders() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get orders placed by this user (as customer)
  const { data: orders } = await supabase
    .from('shop_orders')
    .select('id, shop_id, status, pickup_date, pickup_time, subtotal, delivery_fee, total, notes, is_delivery, delivery_address, created_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) {
    return { orders: [] }
  }

  // Get shop names for each order
  const shopIds = [...new Set(orders.map(o => o.shop_id))]
  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, slug')
    .in('id', shopIds)

  const shopMap = new Map((shops || []).map(s => [s.id, s]))

  // Get items for all orders
  const orderIds = orders.map(o => o.id)
  const { data: items } = await supabase
    .from('shop_order_items')
    .select('order_id, product_name, quantity, unit_price, total_price')
    .in('order_id', orderIds)

  const itemsByOrder = new Map<string, OrderItem[]>()
  for (const item of items || []) {
    const existing = itemsByOrder.get(item.order_id) || []
    existing.push(item)
    itemsByOrder.set(item.order_id, existing)
  }

  return {
    orders: orders.map(o => ({
      ...o,
      shops: shopMap.get(o.shop_id) || null,
      items: itemsByOrder.get(o.id) || [],
    })),
  }
}

export const metadata = {
  title: "My Orders | Maker's Market",
}

export default async function MyOrdersPage() {
  const { orders } = await getMyOrders()

  return (
    <main className="min-h-screen bg-[#F7F1E6] px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/shops"
            className="mb-4 inline-flex items-center gap-1 text-sm text-[#6E5D4E] hover:text-[#261C16]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shops
          </Link>
          <h1 className="text-3xl font-bold text-[#261C16]">My Orders</h1>
          <p className="mt-1 text-sm text-[#6E5D4E]">Track your orders from local makers</p>
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-[#d8c7b2] bg-[#fff9ef] p-12 text-center">
            <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-[#d8c7b2]" />
            <p className="text-lg font-semibold text-[#261C16]">No orders yet</p>
            <p className="mt-1 text-sm text-[#6E5D4E]">
              Browse shops and place your first order!
            </p>
            <Link
              href="/shops"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-amber-700 hover:to-orange-700"
            >
              Browse Shops
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const StatusIcon = config.icon

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-[#d8c7b2] bg-[#fff9ef] p-5 shadow-sm"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {order.shops && (
                        <Link
                          href={`/shop/${order.shops.slug}`}
                          className="text-lg font-semibold text-[#261C16] hover:text-amber-700"
                        >
                          {order.shops.name}
                        </Link>
                      )}
                      <p className="text-xs text-[#6E5D4E]">
                        Order #{order.id.slice(0, 8).toUpperCase()} &bull;{' '}
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </div>

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {order.items.map((item: OrderItem, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-[#261C16]">
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="font-medium text-[#261C16]">
                            ${item.total_price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total + fulfillment */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#d8c7b2]/50 pt-4">
                    <div className="text-sm text-[#6E5D4E]">
                      {order.is_delivery ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          Delivery{order.delivery_address ? ` to ${order.delivery_address}` : ''}
                        </span>
                      ) : order.pickup_date ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Pickup: {new Date(order.pickup_date).toLocaleDateString()}
                          {order.pickup_time ? ` at ${order.pickup_time}` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Pickup — time TBD
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {order.delivery_fee > 0 && (
                        <p className="text-xs text-[#6E5D4E]">
                          Delivery fee: ${order.delivery_fee.toFixed(2)}
                        </p>
                      )}
                      <p className="text-lg font-bold text-[#261C16]">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-3 rounded-xl bg-[#f5edd8] p-3 text-xs text-[#6E5D4E]">
                      <span className="font-semibold">Your note:</span> {order.notes}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
