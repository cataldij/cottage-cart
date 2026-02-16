'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Search,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled'

interface Order {
  id: string
  customer_name: string
  customer_email: string
  status: OrderStatus
  pickup_date: string
  pickup_time: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  notes: string | null
  created_at: string
}

const DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customer_name: 'Sarah Mitchell',
    customer_email: 'sarah@example.com',
    status: 'pending',
    pickup_date: '2026-02-21',
    pickup_time: '10:00 AM',
    items: [
      { name: 'Sourdough Boule', quantity: 2, price: 8.00 },
      { name: 'Chocolate Croissant', quantity: 4, price: 4.50 },
    ],
    total: 34.00,
    notes: 'Please slice the sourdough',
    created_at: '2026-02-15T14:30:00Z',
  },
  {
    id: 'ORD-002',
    customer_name: 'Mike Torres',
    customer_email: 'mike@example.com',
    status: 'confirmed',
    pickup_date: '2026-02-21',
    pickup_time: '2:00 PM',
    items: [
      { name: 'Habanero Mango Hot Sauce', quantity: 3, price: 9.00 },
    ],
    total: 27.00,
    notes: null,
    created_at: '2026-02-14T09:15:00Z',
  },
  {
    id: 'ORD-003',
    customer_name: 'Lisa Kim',
    customer_email: 'lisa@example.com',
    status: 'ready',
    pickup_date: '2026-02-22',
    pickup_time: '11:00 AM',
    items: [
      { name: 'Seasonal Truffle Box (6pc)', quantity: 1, price: 24.00 },
      { name: 'Cinnamon Raisin Loaf', quantity: 1, price: 9.50 },
    ],
    total: 33.50,
    notes: 'Gift wrapping please!',
    created_at: '2026-02-13T18:00:00Z',
  },
  {
    id: 'ORD-004',
    customer_name: 'James Wilson',
    customer_email: 'james@example.com',
    status: 'picked_up',
    pickup_date: '2026-02-15',
    pickup_time: '9:00 AM',
    items: [
      { name: 'Sourdough Boule', quantity: 1, price: 8.00 },
    ],
    total: 8.00,
    notes: null,
    created_at: '2026-02-12T11:00:00Z',
  },
]

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  ready: { label: 'Ready', color: 'text-green-700', bg: 'bg-green-50', icon: Package },
  picked_up: { label: 'Picked Up', color: 'text-slate-500', bg: 'bg-slate-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>(DEMO_ORDERS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null)

  const filtered = orders.filter(o => {
    const matchesSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || o.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const pendingCount = orders.filter(o => o.status === 'pending').length
  const todayRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">{pendingCount} pending &bull; ${todayRevenue.toFixed(2)} total</p>
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
        <div className="relative flex-1 max-w-sm">
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

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map(order => {
          const config = STATUS_CONFIG[order.status]
          const StatusIcon = config.icon
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
                      <span className="text-xs text-slate-400">{order.id}</span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm text-slate-600">
                          {item.quantity}x {item.name} &bull; ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      ))}
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
                  <span className="text-xs text-slate-400">
                    Pickup: {order.pickup_date} at {order.pickup_time}
                  </span>
                </div>
              </div>
              {order.status === 'pending' && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <Button size="sm" className="rounded-full bg-amber-700 text-white hover:bg-amber-800">
                    Confirm Order
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full text-red-600 hover:bg-red-50">
                    Decline
                  </Button>
                </div>
              )}
              {order.status === 'confirmed' && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <Button size="sm" className="rounded-full bg-green-600 text-white hover:bg-green-700">
                    Mark Ready
                  </Button>
                </div>
              )}
              {order.status === 'ready' && (
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <Button size="sm" className="rounded-full bg-slate-800 text-white hover:bg-slate-900">
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
