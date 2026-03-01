'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  TrendingUp,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Snowflake,
  Flower2,
  Leaf,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ProductDemand {
  name: string
  productId: string | null
  avgDaily: number
  avgWeekend: number
  avgWeekday: number
  totalSold: number
  orderCount: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
}

interface DayPattern {
  day: string
  avgOrders: number
  avgRevenue: number
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function PlannerPage() {
  const [shopId, setShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductDemand[]>([])
  const [dayPatterns, setDayPatterns] = useState<DayPattern[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [avgOrdersPerWeek, setAvgOrdersPerWeek] = useState(0)
  const [peakDay, setPeakDay] = useState('')
  const [slowDay, setSlowDay] = useState('')
  const [seasonalInsight, setSeasonalInsight] = useState('')

  // Planning view
  const [planDate, setPlanDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1) // default to tomorrow
    return d.toISOString().split('T')[0]
  })

  const supabase: any = createClient()

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!shop) { setLoading(false); return }
    setShopId(shop.id)

    // Get all non-cancelled orders with items
    const { data: orders } = await supabase
      .from('shop_orders')
      .select('id, total, status, created_at')
      .eq('shop_id', shop.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true })

    const orderList = orders || []
    setTotalOrders(orderList.length)

    if (orderList.length === 0) { setLoading(false); return }

    // Get order items
    const orderIds = orderList.map((o: any) => o.id)
    const { data: items } = await supabase
      .from('shop_order_items')
      .select('order_id, product_name, quantity, total_price')
      .in('order_id', orderIds)

    // Get products for IDs
    const { data: shopProducts } = await supabase
      .from('products')
      .select('id, name')
      .eq('shop_id', shop.id)

    const productIdMap = new Map((shopProducts || []).map((p: any) => [p.name.toLowerCase(), p.id]))

    // --- Analyze day-of-week patterns ---
    const dayBuckets: { orders: number; revenue: number; count: number }[] = Array.from({ length: 7 }, () => ({ orders: 0, revenue: 0, count: 0 }))
    const weeksSet = new Set<string>()

    for (const order of orderList) {
      const d = new Date(order.created_at)
      const dow = d.getDay()
      dayBuckets[dow].orders += 1
      dayBuckets[dow].revenue += Number(order.total || 0)

      // Track weeks for averaging
      const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}`
      weeksSet.add(weekKey)
    }

    const numWeeks = Math.max(weeksSet.size, 1)
    setAvgOrdersPerWeek(Math.round(orderList.length / numWeeks))

    const patterns = dayBuckets.map((b, i) => ({
      day: DAY_SHORT[i],
      avgOrders: Math.round((b.orders / numWeeks) * 10) / 10,
      avgRevenue: Math.round((b.revenue / numWeeks) * 100) / 100,
    }))
    setDayPatterns(patterns)

    const peakIdx = patterns.reduce((max, p, i) => p.avgOrders > patterns[max].avgOrders ? i : max, 0)
    const slowIdx = patterns.reduce((min, p, i) => p.avgOrders < patterns[min].avgOrders ? i : min, 0)
    setPeakDay(DAY_NAMES[peakIdx])
    setSlowDay(DAY_NAMES[slowIdx])

    // --- Analyze product demand ---
    const productStats = new Map<string, { quantity: number; orders: Set<string>; weekdayQty: number; weekendQty: number; recentQty: number; olderQty: number }>()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const orderDateMap = new Map(orderList.map((o: any) => [o.id, new Date(o.created_at)]))

    for (const item of items || []) {
      const orderDate = orderDateMap.get(item.order_id)
      if (!orderDate) continue

      const key = item.product_name
      if (!productStats.has(key)) {
        productStats.set(key, { quantity: 0, orders: new Set(), weekdayQty: 0, weekendQty: 0, recentQty: 0, olderQty: 0 })
      }

      const stat = productStats.get(key)!
      stat.quantity += item.quantity
      stat.orders.add(item.order_id)

      const dow = orderDate.getDay()
      if (dow === 0 || dow === 6) {
        stat.weekendQty += item.quantity
      } else {
        stat.weekdayQty += item.quantity
      }

      if (orderDate >= thirtyDaysAgo) {
        stat.recentQty += item.quantity
      } else if (orderDate >= sixtyDaysAgo) {
        stat.olderQty += item.quantity
      }
    }

    // Calculate days for averaging
    const firstOrder = new Date(orderList[0].created_at)
    const totalDays = Math.max(Math.ceil((Date.now() - firstOrder.getTime()) / 86400000), 1)
    const weekdays = Math.ceil(totalDays * 5 / 7)
    const weekends = totalDays - weekdays

    const demandList: ProductDemand[] = Array.from(productStats.entries()).map(([name, stat]) => {
      const trendPercent = stat.olderQty > 0
        ? ((stat.recentQty - stat.olderQty) / stat.olderQty) * 100
        : stat.recentQty > 0 ? 100 : 0

      return {
        name,
        productId: productIdMap.get(name.toLowerCase()) || null,
        avgDaily: Math.round((stat.quantity / totalDays) * 10) / 10,
        avgWeekend: weekends > 0 ? Math.round((stat.weekendQty / weekends) * 10) / 10 : 0,
        avgWeekday: weekdays > 0 ? Math.round((stat.weekdayQty / weekdays) * 10) / 10 : 0,
        totalSold: stat.quantity,
        orderCount: stat.orders.size,
        trend: trendPercent > 10 ? 'up' : trendPercent < -10 ? 'down' : 'stable',
        trendPercent: Math.round(trendPercent),
      }
    }).sort((a, b) => b.totalSold - a.totalSold)

    setProducts(demandList)

    // Seasonal insight
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) setSeasonalInsight('Spring is here — consider seasonal items like lemon bars, flower cookies, and berry tarts.')
    else if (month >= 5 && month <= 7) setSeasonalInsight('Summer peak — ice-cold treats, fruit pies, and light pastries tend to sell well.')
    else if (month >= 8 && month <= 10) setSeasonalInsight('Fall season — pumpkin, apple, and cinnamon flavors see a big demand spike.')
    else setSeasonalInsight('Holiday season — gift boxes, holiday cookies, and specialty items see 2-3x normal demand.')

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Get prediction for selected plan date
  const planDateObj = new Date(planDate + 'T12:00:00')
  const planDow = planDateObj.getDay()
  const isWeekend = planDow === 0 || planDow === 6

  const predictions = products.map(p => {
    const base = isWeekend ? p.avgWeekend : p.avgWeekday
    // Add a buffer: round up + 10-20% extra
    const buffer = p.trend === 'up' ? 1.2 : p.trend === 'down' ? 1.05 : 1.1
    const predicted = Math.ceil(base * buffer)
    return { ...p, predicted }
  }).filter(p => p.predicted > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!shopId) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Production Planner</h1>
        <p className="text-muted-foreground">Create your shop first to plan production.</p>
        <Button asChild><Link href="/builder">Create My Shop</Link></Button>
      </div>
    )
  }

  const SeasonIcon = (() => {
    const m = new Date().getMonth()
    if (m >= 2 && m <= 4) return Flower2
    if (m >= 5 && m <= 7) return Sun
    if (m >= 8 && m <= 10) return Leaf
    return Snowflake
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Production Planner</h1>
        <p className="text-sm text-slate-500">Smart predictions to help you make the right amount</p>
      </div>

      {totalOrders === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-lg font-semibold text-slate-700">Not enough data yet</p>
          <p className="mt-1 text-sm text-slate-500">The planner needs order history to make predictions. Keep selling and check back!</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Orders/Week</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{avgOrdersPerWeek}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Peak Day</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{peakDay}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Slow Day</p>
              <p className="mt-1 text-2xl font-bold text-slate-500">{slowDay}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Products Tracked</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{products.length}</p>
            </div>
          </div>

          {/* Day-of-Week Chart */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Orders by Day of Week</h2>
            <p className="mt-1 text-xs text-slate-400">Average orders per day based on your history</p>
            <div className="mt-4 flex items-end gap-3" style={{ height: '140px' }}>
              {dayPatterns.map((p, i) => {
                const max = Math.max(...dayPatterns.map(d => d.avgOrders), 1)
                const height = (p.avgOrders / max) * 100
                const isWeekendDay = i === 0 || i === 6
                return (
                  <div key={p.day} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative w-full">
                      <div className="invisible absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:visible">
                        {p.avgOrders} orders &bull; ${p.avgRevenue.toFixed(0)}
                      </div>
                      <div
                        className={cn(
                          'mx-auto w-full max-w-[48px] rounded-t-lg transition-all',
                          isWeekendDay
                            ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-700 group-hover:to-amber-500'
                            : 'bg-gradient-to-t from-blue-500 to-blue-300 group-hover:from-blue-600 group-hover:to-blue-400'
                        )}
                        style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                      />
                    </div>
                    <span className={cn('text-xs font-medium', isWeekendDay ? 'text-amber-700' : 'text-slate-500')}>
                      {p.day}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex gap-4 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Weekday</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Weekend</span>
            </div>
          </div>

          {/* Production Plan for Date */}
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                <CalendarDays className="mr-2 inline h-5 w-5 text-amber-600" />
                Production Plan
              </h2>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg p-1 hover:bg-amber-100"
                  onClick={() => {
                    const d = new Date(planDate + 'T12:00:00')
                    d.setDate(d.getDate() - 1)
                    setPlanDate(d.toISOString().split('T')[0])
                  }}
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
                <input
                  type="date"
                  value={planDate}
                  onChange={e => setPlanDate(e.target.value)}
                  className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  className="rounded-lg p-1 hover:bg-amber-100"
                  onClick={() => {
                    const d = new Date(planDate + 'T12:00:00')
                    d.setDate(d.getDate() + 1)
                    setPlanDate(d.toISOString().split('T')[0])
                  }}
                >
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {DAY_NAMES[planDow]}{isWeekend ? ' (Weekend — typically higher demand)' : ''} — Suggested quantities based on your sales history
            </p>

            {predictions.length === 0 ? (
              <p className="mt-6 text-center text-sm text-slate-500">No predictions yet — need more order history for this day type.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {predictions.map(p => (
                  <div key={p.name} className="flex items-center gap-4 rounded-xl bg-white/80 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                      <Package className="h-4 w-4 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">
                        Avg: {isWeekend ? p.avgWeekend : p.avgWeekday}/day &bull; {p.totalSold} total sold
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {p.trend === 'down' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      <span className="rounded-full bg-amber-700 px-3 py-1 text-sm font-bold text-white">
                        Make {p.predicted}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seasonal Insight */}
          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <SeasonIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Seasonal Insight</p>
              <p className="mt-1 text-sm text-slate-600">{seasonalInsight}</p>
            </div>
          </div>

          {/* Product Trends Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Product Demand Trends</h2>
            <p className="mt-1 text-xs text-slate-400">30-day trend compared to previous 30 days</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sold</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Avg/Weekday</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Avg/Weekend</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.name} className="border-b border-slate-50">
                      <td className="py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="py-3 text-right text-slate-600">{p.totalSold}</td>
                      <td className="py-3 text-right text-slate-600">{p.avgWeekday}</td>
                      <td className="py-3 text-right font-medium text-amber-700">{p.avgWeekend}</td>
                      <td className="py-3 text-right">
                        <span className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                          p.trend === 'up' ? 'bg-green-100 text-green-700' :
                          p.trend === 'down' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        )}>
                          {p.trend === 'up' ? '+' : ''}{p.trendPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
