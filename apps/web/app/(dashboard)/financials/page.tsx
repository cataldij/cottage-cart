'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  PiggyBank,
  Receipt,
  Loader2,
  ArrowUpRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ProductFinancials {
  name: string
  revenue: number
  estimatedCost: number
  profit: number
  margin: number
  unitsSold: number
  avgPrice: number
}

interface MonthlyPL {
  month: number
  year: number
  revenue: number
  estimatedCogs: number
  profit: number
  orderCount: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function FinancialsPage() {
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [costMarginInput, setCostMarginInput] = useState(40) // Default estimated COGS as % of revenue
  const [showMarginHelper, setShowMarginHelper] = useState(false)

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
      setLoading(false)
      return
    }

    setShopId(shop.id)

    // Get all non-cancelled orders
    const { data: orderData } = await supabase
      .from('shop_orders')
      .select('id, total, status, created_at')
      .eq('shop_id', shop.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true })

    const orderIds = (orderData || []).map((o: any) => o.id)

    // Get order items + products in parallel
    const [itemsRes, productsRes] = await Promise.all([
      orderIds.length > 0
        ? supabase
            .from('shop_order_items')
            .select('product_name, quantity, unit_price, total_price, order_id')
            .in('order_id', orderIds)
        : { data: [] },
      supabase
        .from('products')
        .select('id, name, price, cost_estimate')
        .eq('shop_id', shop.id),
    ])

    setOrders(orderData || [])
    setItems(itemsRes.data || [])
    setProducts(productsRes.data || [])
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

  if (!shopId) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Financial Snapshot</h1>
        <p className="text-muted-foreground">Create your shop first to track financials.</p>
      </div>
    )
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Build product cost map from products table
  const productCostMap = new Map<string, number>()
  for (const p of products) {
    if (p.cost_estimate) {
      productCostMap.set(p.name, Number(p.cost_estimate))
    }
  }

  // Calculate per-product financials
  const productMap = new Map<string, ProductFinancials>()
  for (const item of items) {
    const existing = productMap.get(item.product_name)
    const revenue = Number(item.total_price || 0)
    const unitPrice = Number(item.unit_price || 0)
    const qty = item.quantity || 1

    // Use known cost or estimate from margin %
    const knownCost = productCostMap.get(item.product_name)
    const estimatedCost = knownCost
      ? knownCost * qty
      : revenue * (costMarginInput / 100)

    if (existing) {
      existing.revenue += revenue
      existing.estimatedCost += estimatedCost
      existing.profit += revenue - estimatedCost
      existing.unitsSold += qty
      existing.avgPrice = existing.revenue / existing.unitsSold
      existing.margin = existing.revenue > 0
        ? ((existing.revenue - existing.estimatedCost) / existing.revenue) * 100
        : 0
    } else {
      const profit = revenue - estimatedCost
      productMap.set(item.product_name, {
        name: item.product_name,
        revenue,
        estimatedCost,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0,
        unitsSold: qty,
        avgPrice: unitPrice || revenue / qty,
      })
    }
  }

  const productFinancials = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue)

  // Monthly P&L
  const monthlyMap = new Map<string, MonthlyPL>()
  for (const order of orders) {
    const date = new Date(order.created_at)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    const revenue = Number(order.total || 0)
    const cogs = revenue * (costMarginInput / 100)

    const existing = monthlyMap.get(key)
    if (existing) {
      existing.revenue += revenue
      existing.estimatedCogs += cogs
      existing.profit += revenue - cogs
      existing.orderCount += 1
    } else {
      monthlyMap.set(key, {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        revenue,
        estimatedCogs: cogs,
        profit: revenue - cogs,
        orderCount: 1,
      })
    }
  }

  // Fill in missing months for current year
  for (let m = 1; m <= currentMonth; m++) {
    const key = `${currentYear}-${m}`
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { year: currentYear, month: m, revenue: 0, estimatedCogs: 0, profit: 0, orderCount: 0 })
    }
  }

  const monthlyPL = Array.from(monthlyMap.values())
    .filter(m => m.year === currentYear)
    .sort((a, b) => a.month - b.month)

  // Aggregate stats
  const totalRevenue = monthlyPL.reduce((s, m) => s + m.revenue, 0)
  const totalCogs = monthlyPL.reduce((s, m) => s + m.estimatedCogs, 0)
  const totalProfit = totalRevenue - totalCogs
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  // This month vs last month
  const thisMonth = monthlyPL.find(m => m.month === currentMonth)
  const lastMonth = monthlyPL.find(m => m.month === currentMonth - 1)
  const thisMonthProfit = thisMonth?.profit || 0
  const lastMonthProfit = lastMonth?.profit || 0
  const profitChange = lastMonthProfit > 0
    ? ((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100
    : thisMonthProfit > 0 ? 100 : 0

  // Best & worst margin products
  const bestMarginProduct = productFinancials.length > 0
    ? productFinancials.reduce((best, p) => p.margin > best.margin ? p : best)
    : null
  const worstMarginProduct = productFinancials.length > 1
    ? productFinancials.reduce((worst, p) => p.margin < worst.margin ? p : worst)
    : null

  // Profit bar chart max
  const maxProfit = Math.max(...monthlyPL.map(m => Math.abs(m.profit)), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Wallet className="h-6 w-6 text-amber-600" />
            Financial Snapshot
          </h1>
          <p className="text-sm text-slate-500">
            Profit & loss at a glance — know your margins
          </p>
        </div>
        <Link
          href="/revenue"
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          Full Revenue
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Cost Margin Helper */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <button
          className="flex w-full items-center justify-between"
          onClick={() => setShowMarginHelper(!showMarginHelper)}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              Cost estimates use {costMarginInput}% of revenue as ingredient cost
            </span>
          </div>
          {showMarginHelper ? (
            <ChevronUp className="h-4 w-4 text-blue-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-600" />
          )}
        </button>
        {showMarginHelper && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-blue-700">
              Adjust this to match your actual ingredient costs. Use the Price Calculator to get exact costs per recipe.
              Products with saved cost estimates use those instead.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={80}
                step={5}
                value={costMarginInput}
                onChange={e => setCostMarginInput(Number(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-blue-200 accent-blue-600"
              />
              <span className="w-12 text-center text-sm font-bold text-blue-800">{costMarginInput}%</span>
            </div>
            <div className="flex justify-between text-[10px] text-blue-500">
              <span>Low cost (10%)</span>
              <span>High cost (80%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">YTD Revenue</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-400">{orders.length} orders</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Est. Costs (COGS)</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-red-700">${totalCogs.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-400">{costMarginInput}% ingredient cost estimate</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Net Profit</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <p className={cn('mt-3 text-3xl font-bold', totalProfit >= 0 ? 'text-amber-800' : 'text-red-700')}>
            ${totalProfit.toFixed(2)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs">
            {profitChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={profitChange >= 0 ? 'text-green-600' : 'text-red-600'}>
              {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(1)}%
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Profit Margin</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className={cn('mt-3 text-3xl font-bold', overallMargin >= 50 ? 'text-green-700' : overallMargin >= 30 ? 'text-amber-700' : 'text-red-700')}>
            {overallMargin.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {overallMargin >= 60 ? 'Excellent margins' : overallMargin >= 40 ? 'Healthy margins' : overallMargin >= 20 ? 'Slim margins — consider raising prices' : 'Low margins — review your costs'}
          </p>
        </div>
      </div>

      {/* Profit Chart + Margin Insights */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Monthly Profit Chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Monthly Profit</h2>
          <p className="text-xs text-slate-400">{currentYear} — Revenue minus estimated costs</p>
          <div className="mt-6">
            {monthlyPL.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PiggyBank className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-500">No data yet</p>
              </div>
            ) : (
              <div className="flex items-end gap-2" style={{ height: '200px' }}>
                {monthlyPL.map(m => {
                  const height = maxProfit > 0 ? (Math.abs(m.profit) / maxProfit) * 100 : 0
                  const isPositive = m.profit >= 0
                  return (
                    <div key={`${m.year}-${m.month}`} className="group flex flex-1 flex-col items-center gap-1">
                      <div className="relative w-full">
                        <div className="invisible absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:visible">
                          ${m.profit.toFixed(2)}
                        </div>
                        <div
                          className={cn(
                            'mx-auto w-full max-w-[40px] rounded-t-lg transition-all',
                            isPositive
                              ? 'bg-gradient-to-t from-green-600 to-green-400 group-hover:from-green-700 group-hover:to-green-500'
                              : 'bg-gradient-to-t from-red-600 to-red-400 group-hover:from-red-700 group-hover:to-red-500'
                          )}
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

        {/* Margin Insights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Margin Insights</h2>
          <div className="mt-4 space-y-4">
            {bestMarginProduct && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600">Best Margin</p>
                <p className="mt-1 text-sm font-bold text-green-800">{bestMarginProduct.name}</p>
                <p className="text-xs text-green-600">{bestMarginProduct.margin.toFixed(1)}% margin — ${bestMarginProduct.profit.toFixed(2)} profit</p>
              </div>
            )}
            {worstMarginProduct && worstMarginProduct.name !== bestMarginProduct?.name && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600">Lowest Margin</p>
                <p className="mt-1 text-sm font-bold text-red-800">{worstMarginProduct.name}</p>
                <p className="text-xs text-red-600">{worstMarginProduct.margin.toFixed(1)}% margin — ${worstMarginProduct.profit.toFixed(2)} profit</p>
              </div>
            )}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quick Tip</p>
              <p className="mt-1 text-xs text-slate-600">
                {overallMargin >= 60
                  ? 'Your margins are strong. Consider reinvesting in growth or new products.'
                  : overallMargin >= 40
                    ? 'Healthy margins. Use the Price Calculator to optimize your top-selling items.'
                    : 'Your margins are tight. Try raising prices 10-15% or finding cheaper ingredient sources.'}
              </p>
            </div>
            <Link
              href="/calculator"
              className="flex items-center justify-center gap-1 rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
            >
              Open Price Calculator
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Product Profitability Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Product Profitability</h2>
          <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800">
            Manage products
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {productFinancials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">No sales data yet</p>
            <p className="text-xs text-slate-400">Product profitability will appear after your first orders</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Est. Cost</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Profit</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Margin</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Units</th>
                </tr>
              </thead>
              <tbody>
                {productFinancials.map(p => (
                  <tr
                    key={p.name}
                    className="cursor-pointer border-b border-slate-50 transition hover:bg-slate-50"
                    onClick={() => setExpandedProduct(expandedProduct === p.name ? null : p.name)}
                  >
                    <td className="py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="py-3 text-right text-slate-900">${p.revenue.toFixed(2)}</td>
                    <td className="py-3 text-right text-red-600">${p.estimatedCost.toFixed(2)}</td>
                    <td className={cn('py-3 text-right font-semibold', p.profit >= 0 ? 'text-green-700' : 'text-red-700')}>
                      ${p.profit.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        p.margin >= 60 ? 'bg-green-100 text-green-700'
                          : p.margin >= 40 ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      )}>
                        {p.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-600">{p.unitsSold}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="py-3 font-bold text-slate-900">Total</td>
                  <td className="py-3 text-right font-bold text-slate-900">${totalRevenue.toFixed(2)}</td>
                  <td className="py-3 text-right font-bold text-red-600">${totalCogs.toFixed(2)}</td>
                  <td className={cn('py-3 text-right font-bold', totalProfit >= 0 ? 'text-green-700' : 'text-red-700')}>
                    ${totalProfit.toFixed(2)}
                  </td>
                  <td className="py-3 text-right">
                    <span className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-bold',
                      overallMargin >= 60 ? 'bg-green-100 text-green-700'
                        : overallMargin >= 40 ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    )}>
                      {overallMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-600">
                    {productFinancials.reduce((s, p) => s + p.unitsSold, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Monthly P&L Breakdown */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Monthly P&L Breakdown</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Month</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Est. COGS</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Profit</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Margin</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Orders</th>
              </tr>
            </thead>
            <tbody>
              {[...monthlyPL].reverse().map(m => {
                const margin = m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0
                return (
                  <tr key={`${m.year}-${m.month}`} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-900">{MONTH_FULL[m.month - 1]}</td>
                    <td className="py-3 text-right text-slate-900">${m.revenue.toFixed(2)}</td>
                    <td className="py-3 text-right text-red-600">${m.estimatedCogs.toFixed(2)}</td>
                    <td className={cn('py-3 text-right font-semibold', m.profit >= 0 ? 'text-green-700' : 'text-red-700')}>
                      ${m.profit.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        margin >= 60 ? 'bg-green-100 text-green-700'
                          : margin >= 40 ? 'bg-amber-100 text-amber-700'
                            : margin > 0 ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-400'
                      )}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-600">{m.orderCount}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="py-3 font-bold text-slate-900">YTD Total</td>
                <td className="py-3 text-right font-bold text-slate-900">${totalRevenue.toFixed(2)}</td>
                <td className="py-3 text-right font-bold text-red-600">${totalCogs.toFixed(2)}</td>
                <td className={cn('py-3 text-right font-bold', totalProfit >= 0 ? 'text-green-700' : 'text-red-700')}>
                  ${totalProfit.toFixed(2)}
                </td>
                <td className="py-3 text-right">
                  <span className={cn(
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-bold',
                    overallMargin >= 60 ? 'bg-green-100 text-green-700'
                      : overallMargin >= 40 ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  )}>
                    {overallMargin.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 text-right font-bold text-slate-600">{orders.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
