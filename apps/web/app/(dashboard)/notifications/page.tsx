import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

async function getNotificationData() {
  const supabase: any = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, is_public, accepting_orders')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!shop) {
    return { shop: null as any, orders: [] as any[], recentBroadcasts: 0 }
  }

  const [ordersRes, broadcastsRes] = await Promise.all([
    supabase
      .from('shop_orders')
      .select('id, customer_name, customer_email, customer_phone, status, total, pickup_date, pickup_time, created_at')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('message_broadcasts')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shop.id),
  ])

  return {
    shop,
    orders: (ordersRes.data || []) as any[],
    recentBroadcasts: broadcastsRes.count || 0,
  }
}

interface Alert {
  id: string
  type: 'action' | 'info' | 'warning' | 'success'
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href?: string
  linkLabel?: string
  time?: string
}

export default async function NotificationsPage() {
  const { shop, orders, recentBroadcasts } = await getNotificationData()

  if (!shop) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Create your shop first to manage notifications.</p>
        <Button asChild>
          <Link href="/builder">Create My Shop</Link>
        </Button>
      </div>
    )
  }

  const pending = orders.filter((o: any) => o.status === 'pending')
  const ready = orders.filter((o: any) => o.status === 'ready')
  const todayOrders = orders.filter((o: any) => {
    const d = new Date(o.created_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const uniqueCustomers = new Set(orders.map((o: any) => o.customer_email)).size
  const totalRevenue = orders
    .filter((o: any) => o.status !== 'cancelled')
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

  // Build smart alerts
  const alerts: Alert[] = []

  if (pending.length > 0) {
    alerts.push({
      id: 'pending',
      type: 'action',
      icon: AlertTriangle,
      title: `${pending.length} order${pending.length !== 1 ? 's' : ''} need${pending.length === 1 ? 's' : ''} confirmation`,
      description: `${pending.map((o: any) => o.customer_name).slice(0, 3).join(', ')}${pending.length > 3 ? ` and ${pending.length - 3} more` : ''}`,
      href: '/orders',
      linkLabel: 'Review Orders',
    })
  }

  if (ready.length > 0) {
    alerts.push({
      id: 'ready',
      type: 'info',
      icon: Package,
      title: `${ready.length} order${ready.length !== 1 ? 's' : ''} ready for pickup`,
      description: 'Waiting on customers to pick up',
      href: '/orders',
      linkLabel: 'View Orders',
    })
  }

  if (!shop.is_public) {
    alerts.push({
      id: 'not-public',
      type: 'warning',
      icon: AlertTriangle,
      title: 'Your shop is not visible to customers',
      description: 'Enable public listing in Settings to appear on the marketplace',
      href: '/settings',
      linkLabel: 'Go to Settings',
    })
  }

  if (!shop.accepting_orders && shop.is_public) {
    alerts.push({
      id: 'not-accepting',
      type: 'warning',
      icon: XCircle,
      title: 'Orders are paused',
      description: 'Your shop is visible but not accepting new orders',
      href: '/settings',
      linkLabel: 'Enable Orders',
    })
  }

  if (todayOrders.length > 0) {
    alerts.push({
      id: 'today',
      type: 'success',
      icon: TrendingUp,
      title: `${todayOrders.length} order${todayOrders.length !== 1 ? 's' : ''} today`,
      description: `$${todayOrders.reduce((s: number, o: any) => s + (o.total || 0), 0).toFixed(2)} in revenue today`,
      href: '/revenue',
      linkLabel: 'View Revenue',
    })
  }

  if (recentBroadcasts === 0 && uniqueCustomers > 0) {
    alerts.push({
      id: 'broadcast',
      type: 'info',
      icon: Mail,
      title: 'Engage your customers',
      description: `You have ${uniqueCustomers} customer${uniqueCustomers !== 1 ? 's' : ''} — send your first broadcast`,
      href: '/messages',
      linkLabel: 'Send Broadcast',
    })
  }

  const alertStyles = {
    action: 'border-amber-300 bg-amber-50',
    warning: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
  }

  const alertIconStyles = {
    action: 'bg-amber-100 text-amber-700',
    warning: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500">
          Activity center for {shop.name}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Link href="/orders" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pending.length}</p>
        </Link>
        <Link href="/orders" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ready</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{ready.length}</p>
        </Link>
        <Link href="/customers" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customers</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{uniqueCustomers}</p>
        </Link>
        <Link href="/revenue" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
        </Link>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Action Items</h2>
          {alerts.map(alert => {
            const Icon = alert.icon
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-4 rounded-2xl border p-4 ${alertStyles[alert.type]}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${alertIconStyles[alert.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                  <p className="text-sm text-slate-600">{alert.description}</p>
                </div>
                {alert.href && (
                  <Link
                    href={alert.href}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:shadow-md"
                  >
                    {alert.linkLabel}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}

      {alerts.length === 0 && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <p className="font-semibold text-green-800">All caught up!</p>
          <p className="text-sm text-green-600">No action items right now</p>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800">
            All orders <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No activity yet</p>
            <p className="text-xs text-slate-400">Orders and events will appear here</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {orders.slice(0, 15).map((order: any) => {
              const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
                pending: { label: 'New Order', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
                confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
                ready: { label: 'Ready', color: 'text-green-700', bg: 'bg-green-50', icon: Package },
                picked_up: { label: 'Complete', color: 'text-slate-500', bg: 'bg-slate-100', icon: CheckCircle },
                cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
              }
              const config = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = config.icon

              const timeAgo = getTimeAgo(order.created_at)

              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-slate-900">{order.customer_name}</span>
                      <span className="text-slate-500"> — </span>
                      <span className={`font-medium ${config.color}`}>{config.label}</span>
                    </p>
                    <p className="text-xs text-slate-400">{order.customer_email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">${order.total?.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">{timeAgo}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
