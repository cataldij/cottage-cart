// @ts-nocheck
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight,
  Calculator,
  ChefHat,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
  ShieldCheck,
  AlertTriangle,
  Users,
  BarChart3,
  Gift,
  Star,
} from 'lucide-react'

async function getDashboardData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's shop
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('created_by', user.id)
    .single()

  if (!shop) {
    return { shop: null, products: 0, orders: [], totalRevenue: 0, pendingOrders: 0 }
  }

  // Get stats in parallel
  const [
    { count: productCount },
    { data: recentOrders },
    { data: allOrders },
    { data: compliance },
    { data: stateRules },
    { data: customerProfiles },
    { data: loyaltyProgram },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shop.id),
    supabase
      .from('shop_orders')
      .select('*')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('shop_orders')
      .select('total, status, created_at, customer_email')
      .eq('shop_id', shop.id),
    supabase
      .from('shop_compliance')
      .select('state_code, registration_status, food_handler_status, insurance_status')
      .eq('shop_id', shop.id)
      .maybeSingle(),
    supabase
      .from('state_compliance_rules')
      .select('state_code, revenue_cap, state_name')
      .in('state_code', [(await supabase.from('shop_compliance').select('state_code').eq('shop_id', shop.id).maybeSingle()).data?.state_code || 'XX']),
    supabase
      .from('customer_profiles')
      .select('is_favorite')
      .eq('shop_id', shop.id),
    supabase
      .from('loyalty_programs')
      .select('id, is_active')
      .eq('shop_id', shop.id)
      .maybeSingle(),
  ])

  const orders = allOrders || []
  const nonCancelled = orders.filter((o: any) => o.status !== 'cancelled')
  const totalRevenue = nonCancelled.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length

  // This month's revenue
  const now = new Date()
  const thisMonthOrders = nonCancelled.filter((o: any) => {
    const d = new Date(o.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const thisMonthRevenue = thisMonthOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

  // Unique customers
  const uniqueCustomers = new Set(orders.map((o: any) => o.customer_email?.toLowerCase()).filter(Boolean)).size

  // Revenue cap
  const stateRule = stateRules?.[0]
  const revenueCap = stateRule?.revenue_cap || null
  const ytdRevenue = nonCancelled
    .filter((o: any) => new Date(o.created_at).getFullYear() === now.getFullYear())
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0)
  const capPercent = revenueCap ? (ytdRevenue / revenueCap) * 100 : null

  // Compliance score
  const complianceItems = compliance ? [
    compliance.registration_status,
    compliance.food_handler_status,
    compliance.insurance_status,
  ].filter(s => s === 'active').length : 0

  return {
    shop,
    products: productCount || 0,
    orders: recentOrders || [],
    totalRevenue,
    pendingOrders,
    totalOrders: orders.length,
    thisMonthRevenue,
    uniqueCustomers,
    revenueCap,
    ytdRevenue,
    capPercent,
    stateName: stateRule?.state_name || null,
    complianceItems,
    complianceTotal: compliance ? 3 : 0,
    favoriteCustomers: (customerProfiles || []).filter((p: any) => p.is_favorite).length,
    hasLoyalty: loyaltyProgram?.is_active || false,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return <div>Loading...</div>
  }

  // No shop yet - show onboarding
  if (!data.shop) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 text-white shadow-lg">
          <ChefHat className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome to Maker's Market</h1>
          <p className="mt-2 text-slate-500">
            Create your shop to start selling your homemade goods
          </p>
        </div>
        <Button asChild className="rounded-full bg-amber-700 px-8 text-white hover:bg-amber-800">
          <Link href="/builder">Create My Shop</Link>
        </Button>
      </div>
    )
  }

  const stats = [
    {
      name: 'This Month',
      value: `$${formatNumber(data.thisMonthRevenue)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      href: '/revenue',
    },
    {
      name: 'Total Orders',
      value: data.totalOrders || 0,
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-500',
      href: '/orders',
    },
    {
      name: 'Pending',
      value: data.pendingOrders,
      icon: Package,
      color: 'from-amber-400 to-yellow-500',
      href: '/orders',
    },
    {
      name: 'Customers',
      value: data.uniqueCustomers,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      href: '/customers',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur-xl">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.25),_transparent_70%)] opacity-70 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.25),_transparent_70%)] opacity-70 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]" />
            {data.shop.accepting_orders ? 'Accepting orders' : 'Orders paused'}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {data.shop.name}
          </h1>
          {data.shop.tagline && (
            <p className="mt-2 text-slate-500">{data.shop.tagline}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-amber-700 px-5 text-white shadow-soft hover:bg-amber-800">
              <Link href="/products">Manage Products</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-full border-white/70 bg-white/80 px-5 text-slate-700 shadow-soft hover:bg-white"
            >
              <Link href={`/shop/${data.shop.slug}`} target="_blank">
                View Storefront
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Revenue Cap Alert */}
      {data.capPercent !== null && data.capPercent >= 80 && (
        <div className={`flex items-center gap-3 rounded-2xl p-4 ${
          data.capPercent >= 95
            ? 'border border-red-200 bg-red-50'
            : 'border border-amber-200 bg-amber-50'
        }`}>
          <AlertTriangle className={`h-5 w-5 ${data.capPercent >= 95 ? 'text-red-600' : 'text-amber-600'}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${data.capPercent >= 95 ? 'text-red-800' : 'text-amber-800'}`}>
              {data.capPercent >= 95 ? 'Revenue cap nearly reached!' : 'Approaching revenue cap'}
            </p>
            <p className={`text-xs ${data.capPercent >= 95 ? 'text-red-600' : 'text-amber-600'}`}>
              ${data.ytdRevenue.toFixed(0)} of ${data.revenueCap.toFixed(0)} YTD ({data.capPercent.toFixed(1)}%) — {data.stateName}
            </p>
          </div>
          <Link href="/compliance" className="text-xs font-medium underline">
            View Details
          </Link>
        </div>
      )}

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stat.name}
              </p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
            </p>
          </Link>
        ))}
      </section>

      {/* Content Grid */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Recent Orders */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800">
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {data.orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No orders yet</p>
              <p className="text-xs text-slate-400">Share your shop link to start receiving orders</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {data.orders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{order.customer_name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${order.total?.toFixed(2)}</p>
                    <span className={`text-xs font-medium ${
                      order.status === 'pending' ? 'text-amber-600' :
                      order.status === 'confirmed' ? 'text-blue-600' :
                      order.status === 'ready' ? 'text-green-600' :
                      'text-slate-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Compliance Summary */}
          {data.complianceTotal > 0 && (
            <Link
              href="/compliance"
              className="block rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Compliance</h3>
                <ShieldCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${(data.complianceItems / data.complianceTotal) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {data.complianceItems}/{data.complianceTotal}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {data.complianceItems === data.complianceTotal
                  ? 'All requirements met'
                  : `${data.complianceTotal - data.complianceItems} item${data.complianceTotal - data.complianceItems > 1 ? 's' : ''} need attention`}
              </p>
            </Link>
          )}

          {/* Revenue Cap Widget */}
          {data.revenueCap && (
            <Link
              href="/revenue"
              className="block rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Revenue Cap</h3>
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">${formatNumber(data.ytdRevenue)}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      data.capPercent! >= 95 ? 'bg-red-500' : data.capPercent! >= 80 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(data.capPercent!, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  ${formatNumber(data.revenueCap)}
                </span>
              </div>
            </Link>
          )}

          {/* Quick Actions */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
            <div className="mt-4 space-y-3">
              <Link
                href="/products"
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Add Product</p>
                  <p className="text-xs text-slate-500">List a new menu item</p>
                </div>
              </Link>
              <Link
                href="/revenue"
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Revenue Analytics</p>
                  <p className="text-xs text-slate-500">Track your earnings</p>
                </div>
              </Link>
              <Link
                href="/calculator"
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Price Calculator</p>
                  <p className="text-xs text-slate-500">AI-powered recipe costing</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Shop Link */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-semibold text-amber-800">Your Shop Link</h3>
            <p className="mt-1 text-xs text-amber-600">Share this with customers</p>
            <div className="mt-3 rounded-lg bg-white p-3 text-sm font-mono text-slate-700 break-all">
              cottage-cart.vercel.app/shop/{data.shop.slug}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
