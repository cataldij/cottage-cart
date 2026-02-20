'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Search,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  status: OrderStatus
  pickup_date: string | null
  pickup_time: string | null
  subtotal: number
  delivery_fee: number
  total: number
  notes: string | null
  is_delivery: boolean
  created_at: string
  items: OrderItem[]
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  ready: { label: 'Ready', color: 'text-green-700', bg: 'bg-green-50', icon: Package },
  picked_up: { label: 'Picked Up', color: 'text-slate-500', bg: 'bg-slate-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null)

  // Cast to any — generated DB types don't include CottageCart tables yet
  const supabase: any = createClient()

  const loadOrders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Get user's shop
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!shop) {
      setLoading(false)
      return
    }

    // Get orders with items
    const { data: ordersData } = await supabase
      .from('shop_orders')
      .select('*')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })

    if (ordersData) {
      // Get items for each order
      const orderIds = ordersData.map((o: any) => o.id)
      const { data: itemsData } = orderIds.length > 0
        ? await supabase
            .from('shop_order_items')
            .select('*')
            .in('order_id', orderIds)
        : { data: [] }

      const ordersWithItems = ordersData.map((order: any) => ({
        ...order,
        items: (itemsData || []).filter((item: any) => item.order_id === order.id),
      }))

      setOrders(ordersWithItems)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId)
    await supabase
      .from('shop_orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    await loadOrders()
    setUpdating(null)
  }

  const filtered = orders.filter(o => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || o.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">
            {pendingCount} pending &bull; ${totalRevenue.toFixed(2)} total revenue
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-amber-700' },
          { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: 'text-blue-700' },
          { label: 'Ready', value: orders.filter(o => o.status === 'ready').length, color: 'text-green-700' },
          { label: 'Picked Up', value: orders.filter(o => o.status === 'picked_up').length, color: 'text-slate-500' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
            <p className={cn('mt-1 text-2xl font-bold', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div className="flex gap-2">
          <button
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              !filterStatus ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
            onClick={() => setFilterStatus(null)}
          >
            All
          </button>
          {(['pending', 'confirmed', 'ready', 'picked_up'] as OrderStatus[]).map(status => (
            <button
              key={status}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                filterStatus === status ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
              onClick={() => setFilterStatus(status)}
            >
              {STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16">
          <ShoppingBag className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No orders yet</p>
          <p className="text-xs text-slate-400">Orders will appear here when customers place them through your shop</p>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map(order => {
          const config = STATUS_CONFIG[order.status]
          const StatusIcon = config.icon
          const isUpdating = updating === order.id
          return (
            <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <ShoppingBag className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{order.customer_name}</span>
                      <span className="text-xs text-slate-400">{order.id.slice(0, 8)}...</span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm text-slate-600">
                          {item.quantity}x {item.product_name} &bull; ${item.total_price.toFixed(2)}
                        </p>
                      ))}
                      {order.items.length === 0 && (
                        <p className="text-sm text-slate-400">Order total: ${order.total.toFixed(2)}</p>
                      )}
                    </div>
                    {order.notes && (
                      <p className="mt-2 text-xs italic text-slate-400">Note: {order.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-slate-900">${order.total.toFixed(2)}</span>
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', config.bg, config.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </span>
                  {order.pickup_date && (
                    <span className="text-xs text-slate-400">
                      Pickup: {order.pickup_date}{order.pickup_time ? ` at ${order.pickup_time}` : ''}
                    </span>
                  )}
                </div>
              </div>
              {order.status === 'pending' && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <Button
                    size="sm"
                    className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
                    disabled={isUpdating}
                    onClick={() => updateStatus(order.id, 'confirmed')}
                  >
                    {isUpdating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                    Confirm Order
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-red-600 hover:bg-red-50"
                    disabled={isUpdating}
                    onClick={() => updateStatus(order.id, 'cancelled')}
                  >
                    Decline
                  </Button>
                </div>
              )}
              {order.status === 'confirmed' && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <Button
                    size="sm"
                    className="rounded-full bg-green-600 text-white hover:bg-green-700"
                    disabled={isUpdating}
                    onClick={() => updateStatus(order.id, 'ready')}
                  >
                    {isUpdating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                    Mark Ready
                  </Button>
                </div>
              )}
              {order.status === 'ready' && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <Button
                    size="sm"
                    className="rounded-full bg-slate-800 text-white hover:bg-slate-900"
                    disabled={isUpdating}
                    onClick={() => updateStatus(order.id, 'picked_up')}
                  >
                    {isUpdating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                    Mark Picked Up
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
