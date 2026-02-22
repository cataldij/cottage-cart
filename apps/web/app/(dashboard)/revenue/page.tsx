'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  ArrowUpRight,
  Calendar,
  BarChart3,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface MonthlyData {
  month: number
  year: number
  revenue: number
  orderCount: number
}

interface TopProduct {
  name: string
  quantity: number
  revenue: number
}

interface RevenueData {
  shop: { id: string; name: string; state_code?: string } | null
  orders: any[]
  monthlyData: MonthlyData[]
  topProducts: TopProduct[]
  revenueCap: number | null
  stateCode: string | null
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('year')

  const supabase: any = createClient()

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: shop } = await supabase
      .from('shops')
      .select('id, name')
      .eq('created_by', session.user.id)
      .single()

    if (!shop) {
      setData({ shop: null, orders: [], monthlyData: [], topProducts: [], revenueCap: null, stateCode: null })
      setLoading(false)
      return
    }

    // Parallel queries
    const [ordersRes, complianceRes, itemsRes] = await Promise.all([
      supabase
        .from('shop_orders')
        .select('id, total, status, created_at, customer_name, customer_email')
        .eq('shop_id', shop.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true }),
      supabase
        .from('shop_compliance')
        .select('state_code')
        .eq('shop_id', shop.id)
        .maybeSingle(),
      supabase
        .from('shop_order_items')
        .select('product_name, quantity, total_price, order_id')
        .in('order_id', (await supabase
          .from('shop_orders')
          .select('id')
          .eq('shop_id', shop.id)
          .neq('status', 'cancelled')).data?.map((o: any) => o.id) || []),
    ])

    const orders = ordersRes.data || []
    const stateCode = complianceRes.data?.state_code || null

    // Get revenue cap if state is set
    let revenueCap: number | null = null
    if (stateCode) {
      const { data: stateRules } = await supabase
        .from('state_compliance_rules')
        .select('revenue_cap')
        .eq('state_code', stateCode)
        .maybeSingle()
      revenueCap = stateRules?.revenue_cap || null
    }

    // Build monthly data
    const monthlyMap = new Map<string, MonthlyData>()
    for (const order of orders) {
      const date = new Date(order.created_at)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      const existing = monthlyMap.get(key)
      if (existing) {
        existing.revenue += Number(order.total || 0)
        existing.orderCount += 1
      } else {
        monthlyMap.set(key, {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          revenue: Number(order.total || 0),
          orderCount: 1,
        })
      }
    }

    // Fill in missing months for current year
    const now = new Date()
    const currentYear = now.getFullYear()
    for (let m = 1; m <= now.getMonth() + 1; m++) {
      const key = `${currentYear}-${m}`
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { year: currentYear, month: m, revenue: 0, orderCount: 0 })
      }
    }

    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    // Top products
    const productMap = new Map<string, TopProduct>()
    for (const item of itemsRes.data || []) {
      const existing = productMap.get(item.product_name)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += Number(item.total_price || 0)
      } else {
        productMap.set(item.product_name, {
          name: item.product_name,
          quantity: item.quantity,
          revenue: Number(item.total_price || 0),
        })
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)

    setData({ shop, orders, monthlyData, topProducts, revenueCap, stateCode })
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!data?.shop) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Revenue</h1>
        <p className="text-muted-foreground">Create your shop first to track revenue.</p>
      </div>
    )
  }

  const { orders, monthlyData, topProducts, revenueCap } = data

  // Calculate stats
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const ytdRevenue = monthlyData
    .filter(m => m.year === currentYear)
    .reduce((sum, m) => sum + m.revenue, 0)

  const thisMonthData = monthlyData.find(m => m.year === currentYear && m.month === currentMonth)
  const lastMonthData = monthlyData.find(m => {
    if (currentMonth === 1) return m.year === currentYear - 1 && m.month === 12
    return m.year === currentYear && m.month === currentMonth - 1
  })

  const thisMonthRevenue = thisMonthData?.revenue || 0
  const lastMonthRevenue = lastMonthData?.revenue || 0
  const monthChange = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
    : thisMonthRevenue > 0 ? 100 : 0

  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? ytdRevenue / totalOrders : 0

  // Revenue cap
  const capPercent = revenueCap ? (ytdRevenue / revenueCap) * 100 : null
  const capColor = capPercent === null ? '' : capPercent >= 95 ? 'text-red-600' : capPercent >= 80 ? 'text-amber-600' : 'text-green-600'
  const capBg = capPercent === null ? '' : capPercent >= 95 ? 'bg-red-500' : capPercent >= 80 ? 'bg-amber-500' : 'bg-green-500'

  // Chart data - filter by period
  let chartData = monthlyData.filter(m => m.year === currentYear)
  if (period === 'quarter') {
    const q = Math.floor((currentMonth - 1) / 3) * 3 + 1
    chartData = chartData.filter(m => m.month >= q && m.month <= q + 2)
  } else if (period === 'month') {
    chartData = chartData.filter(m => m.month === currentMonth)
  }

  const maxRevenue = Math.max(...chartData.map(m => m.revenue), 1)

  // Projected annual (based on current pace)
  const monthsElapsed = currentMonth
  const projectedAnnual = monthsElapsed > 0 ? (ytdRevenue / monthsElapsed) * 12 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
          <p className="text-sm text-slate-500">Track your earnings and business growth</p>
        </div>
        <div className="flex gap-2">
          {(['month', 'quarter', 'year'] as const).map(p => (
            <button
              key={p}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                period === p ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
              onClick={() => setPeriod(p)}
            >
              {p === 'month' ? 'This Month' : p === 'quarter' ? 'Quarter' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Cap Warning */}
      {capPercent !== null && capPercent >= 80 && (
        <div className={cn(
          'flex items-center gap-3 rounded-2xl p-4',
          capPercent >= 95 ? 'border border-red-200 bg-red-50' : 'border border-amber-200 bg-amber-50'
        )}>
          <AlertTriangle className={cn('h-5 w-5', capPercent >= 95 ? 'text-red-600' : 'text-amber-600')} />
          <div>
            <p className={cn('text-sm font-semibold', capPercent >= 95 ? 'text-red-800' : 'text-amber-800')}>
              {capPercent >= 95 ? 'Revenue cap nearly reached!' : 'Approaching revenue cap'}
            </p>
            <p className={cn('text-xs', capPercent >= 95 ? 'text-red-600' : 'text-amber-600')}>
              ${ytdRevenue.toFixed(0)} of ${revenueCap!.toFixed(0)} ({capPercent.toFixed(1)}%) — {data.stateCode} state limit
            </p>
          </div>
          <Link href="/compliance" className="ml-auto text-xs font-medium underline">
            View Compliance
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">This Month</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">${thisMonthRevenue.toFixed(2)}</p>
          <div className="mt-1 flex items-center gap-1 text-xs">
            {monthChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={monthChange >= 0 ? 'text-green-600' : 'text-red-600'}>
              {monthChange >= 0 ? '+' : ''}{monthChange.toFixed(1)}%
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">YTD Revenue</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">${ytdRevenue.toFixed(2)}</p>
          {revenueCap && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className={capColor}>{capPercent!.toFixed(1)}% of cap</span>
                <span className="text-slate-400">${revenueCap.toFixed(0)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full transition-all', capBg)} style={{ width: `${Math.min(capPercent!, 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Orders</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalOrders}</p>
          <p className="mt-1 text-xs text-slate-400">{thisMonthData?.orderCount || 0} this month</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Order Value</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">${avgOrderValue.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-400">Projected annual: ${projectedAnnual.toFixed(0)}</p>
        </div>
      </div>

      {/* Chart + Top Products */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Revenue Chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Monthly Revenue</h2>
            <span className="text-xs text-slate-400">{currentYear}</span>
          </div>
          <div className="mt-6">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-500">No revenue data yet</p>
              </div>
            ) : (
              <div className="flex items-end gap-2" style={{ height: '200px' }}>
                {chartData.map(m => {
                  const height = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0
                  return (
                    <div key={`${m.year}-${m.month}`} className="group flex flex-1 flex-col items-center gap-1">
                      <div className="relative w-full">
                        <div className="invisible absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:visible">
                          ${m.revenue.toFixed(2)}
                        </div>
                        <div
                          className="mx-auto w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all group-hover:from-amber-700 group-hover:to-amber-500"
                          style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">{MONTH_NAMES[m.month - 1]}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
            <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800">
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingBag className="mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No sales data yet</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.quantity} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">${product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Monthly Breakdown</h2>
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Month</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Orders</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData
                .filter(m => m.year === currentYear)
                .reverse()
                .map(m => (
                  <tr key={`${m.year}-${m.month}`} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-900">{MONTH_FULL[m.month - 1]} {m.year}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">${m.revenue.toFixed(2)}</td>
                    <td className="py-3 text-right text-slate-600">{m.orderCount}</td>
                    <td className="py-3 text-right text-slate-600">
                      ${m.orderCount > 0 ? (m.revenue / m.orderCount).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="py-3 font-bold text-slate-900">YTD Total</td>
                <td className="py-3 text-right font-bold text-slate-900">${ytdRevenue.toFixed(2)}</td>
                <td className="py-3 text-right font-bold text-slate-600">{totalOrders}</td>
                <td className="py-3 text-right font-bold text-slate-600">${avgOrderValue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
