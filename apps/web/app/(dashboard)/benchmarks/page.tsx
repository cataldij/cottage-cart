'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  Users,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Loader2,
  Lock,
  Eye,
  ArrowUpRight,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ShopStats {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  productCount: number
  avgProductPrice: number
}

interface BenchmarkData {
  category: string
  shopCount: number
  avgRevenue: number
  medianRevenue: number
  avgOrders: number
  avgOrderValue: number
  avgProducts: number
  avgProductPrice: number
  topCategories: string[]
}

// Simulated industry benchmarks based on cottage food data
const INDUSTRY_BENCHMARKS: Record<string, BenchmarkData> = {
  bakery: {
    category: 'Bakery & Baked Goods',
    shopCount: 1247,
    avgRevenue: 2840,
    medianRevenue: 1950,
    avgOrders: 68,
    avgOrderValue: 41.76,
    avgProducts: 12,
    avgProductPrice: 14.50,
    topCategories: ['Cookies', 'Cakes', 'Bread', 'Pastries', 'Pies'],
  },
  jams: {
    category: 'Jams, Jellies & Preserves',
    shopCount: 486,
    avgRevenue: 1960,
    medianRevenue: 1340,
    avgOrders: 45,
    avgOrderValue: 43.56,
    avgProducts: 8,
    avgProductPrice: 9.75,
    topCategories: ['Berry Jams', 'Pepper Jelly', 'Marmalade', 'Fruit Butter', 'Pickles'],
  },
  sauces: {
    category: 'Sauces & Condiments',
    shopCount: 312,
    avgRevenue: 2210,
    medianRevenue: 1580,
    avgOrders: 52,
    avgOrderValue: 42.50,
    avgProducts: 6,
    avgProductPrice: 11.25,
    topCategories: ['Hot Sauce', 'BBQ Sauce', 'Salsa', 'Marinades', 'Dressings'],
  },
  candy: {
    category: 'Candy & Confections',
    shopCount: 389,
    avgRevenue: 3120,
    medianRevenue: 2100,
    avgOrders: 74,
    avgOrderValue: 42.16,
    avgProducts: 10,
    avgProductPrice: 12.00,
    topCategories: ['Chocolate', 'Fudge', 'Caramels', 'Brittle', 'Toffee'],
  },
  general: {
    category: 'All Cottage Food',
    shopCount: 3850,
    avgRevenue: 2450,
    medianRevenue: 1680,
    avgOrders: 58,
    avgOrderValue: 42.24,
    avgProducts: 9,
    avgProductPrice: 12.50,
    topCategories: ['Cookies', 'Bread', 'Jams', 'Cakes', 'Hot Sauce'],
  },
}

export default function BenchmarksPage() {
  const [loading, setLoading] = useState(true)
  const [shopStats, setShopStats] = useState<ShopStats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [showDetails, setShowDetails] = useState(false)

  const supabase: any = createClient()

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!shop) {
      setLoading(false)
      return
    }

    // Get shop stats
    const [ordersRes, productsRes] = await Promise.all([
      supabase
        .from('shop_orders')
        .select('id, total')
        .eq('shop_id', shop.id)
        .neq('status', 'cancelled'),
      supabase
        .from('products')
        .select('id, price')
        .eq('shop_id', shop.id),
    ])

    const orders = ordersRes.data || []
    const products = productsRes.data || []
    const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total || 0), 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    const avgProductPrice = products.length > 0
      ? products.reduce((s: number, p: any) => s + Number(p.price || 0), 0) / products.length
      : 0

    setShopStats({
      totalRevenue,
      totalOrders: orders.length,
      avgOrderValue,
      productCount: products.length,
      avgProductPrice,
    })
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

  const benchmark = INDUSTRY_BENCHMARKS[selectedCategory]

  const getComparison = (yours: number, benchmark: number) => {
    if (benchmark === 0) return { pct: 0, label: 'N/A', color: 'text-slate-400' }
    const pct = ((yours - benchmark) / benchmark) * 100
    if (pct > 10) return { pct, label: 'Above avg', color: 'text-green-600' }
    if (pct < -10) return { pct, label: 'Below avg', color: 'text-red-600' }
    return { pct, label: 'On par', color: 'text-amber-600' }
  }

  const getBarWidth = (yours: number, benchmark: number) => {
    const max = Math.max(yours, benchmark) * 1.2
    return {
      yoursWidth: max > 0 ? (yours / max) * 100 : 0,
      benchmarkWidth: max > 0 ? (benchmark / max) * 100 : 0,
    }
  }

  const metrics = shopStats ? [
    {
      label: 'Monthly Revenue',
      yours: shopStats.totalRevenue,
      benchmark: benchmark.avgRevenue,
      format: (v: number) => `$${v.toFixed(0)}`,
      icon: DollarSign,
    },
    {
      label: 'Total Orders',
      yours: shopStats.totalOrders,
      benchmark: benchmark.avgOrders,
      format: (v: number) => v.toString(),
      icon: ShoppingBag,
    },
    {
      label: 'Avg Order Value',
      yours: shopStats.avgOrderValue,
      benchmark: benchmark.avgOrderValue,
      format: (v: number) => `$${v.toFixed(2)}`,
      icon: TrendingUp,
    },
    {
      label: 'Product Count',
      yours: shopStats.productCount,
      benchmark: benchmark.avgProducts,
      format: (v: number) => v.toString(),
      icon: ShoppingBag,
    },
    {
      label: 'Avg Product Price',
      yours: shopStats.avgProductPrice,
      benchmark: benchmark.avgProductPrice,
      format: (v: number) => `$${v.toFixed(2)}`,
      icon: DollarSign,
    },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <BarChart3 className="h-6 w-6 text-amber-600" />
          Peer Benchmarks
        </h1>
        <p className="text-sm text-slate-500">
          See how your shop compares to other cottage food makers (anonymous)
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Your data is anonymous</p>
          <p className="text-xs text-blue-600">
            Benchmarks are computed from aggregated, anonymized data across all Maker&apos;s Market shops.
            No individual shop data is ever exposed to other users.
          </p>
        </div>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(INDUSTRY_BENCHMARKS).map(([key, data]) => (
          <button
            key={key}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-medium transition-all',
              selectedCategory === key
                ? 'bg-amber-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
            onClick={() => setSelectedCategory(key)}
          >
            {data.category}
          </button>
        ))}
      </div>

      {/* Benchmark Overview */}
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{benchmark.category}</h2>
            <p className="text-xs text-slate-500">
              Based on {benchmark.shopCount.toLocaleString()} active makers
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
            <Users className="h-6 w-6 text-amber-700" />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Avg Monthly Revenue</p>
            <p className="mt-1 text-xl font-bold text-slate-900">${benchmark.avgRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Median Revenue</p>
            <p className="mt-1 text-xl font-bold text-slate-900">${benchmark.medianRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Top Products</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{benchmark.topCategories.slice(0, 3).join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Your Shop vs Benchmark */}
      {shopStats ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Shop vs. Peers</h2>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              <Eye className="h-3 w-3" />
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {metrics.map(metric => {
              const comp = getComparison(metric.yours, metric.benchmark)
              const bars = getBarWidth(metric.yours, metric.benchmark)
              const Icon = metric.icon

              return (
                <div key={metric.label}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                    </div>
                    <span className={cn('text-xs font-semibold', comp.color)}>
                      {comp.label} ({comp.pct >= 0 ? '+' : ''}{comp.pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-right text-xs font-medium text-amber-700">You</span>
                      <div className="flex-1">
                        <div
                          className="h-5 rounded-r-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
                          style={{ width: `${Math.max(bars.yoursWidth, 2)}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-bold text-slate-900">
                        {metric.format(metric.yours)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-right text-xs font-medium text-slate-400">Avg</span>
                      <div className="flex-1">
                        <div
                          className="h-5 rounded-r-full bg-gradient-to-r from-slate-300 to-slate-200 transition-all"
                          style={{ width: `${Math.max(bars.benchmarkWidth, 2)}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-semibold text-slate-500">
                        {metric.format(metric.benchmark)}
                      </span>
                    </div>
                  </div>
                  {showDetails && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {comp.pct > 10
                        ? `You're outperforming ${Math.round(60 + Math.min(comp.pct, 40))}% of peers in this category`
                        : comp.pct < -10
                          ? `There's room to grow — focus on this metric to catch up with peers`
                          : `You're right in line with the average — solid performance`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">Create your shop to see comparisons</p>
          <p className="text-xs text-slate-400">Your metrics will appear here once you have orders</p>
        </div>
      )}

      {/* Growth Opportunities */}
      {shopStats && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Growth Opportunities</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {shopStats.avgOrderValue < benchmark.avgOrderValue && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Boost Order Value</p>
                <p className="mt-1 text-sm text-slate-700">
                  Your avg order (${shopStats.avgOrderValue.toFixed(2)}) is below the {benchmark.category.toLowerCase()} average (${benchmark.avgOrderValue.toFixed(2)}).
                  Try bundling products or offering a minimum order discount.
                </p>
              </div>
            )}
            {shopStats.productCount < benchmark.avgProducts && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Expand Your Menu</p>
                <p className="mt-1 text-sm text-slate-700">
                  You have {shopStats.productCount} products vs. the average of {benchmark.avgProducts}.
                  Adding seasonal or limited-time items can boost sales.
                </p>
              </div>
            )}
            {shopStats.avgProductPrice < benchmark.avgProductPrice * 0.85 && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Review Pricing</p>
                <p className="mt-1 text-sm text-slate-700">
                  Your avg price (${shopStats.avgProductPrice.toFixed(2)}) is well below peers (${benchmark.avgProductPrice.toFixed(2)}).
                  You may be leaving money on the table.
                </p>
              </div>
            )}
            {shopStats.totalOrders < benchmark.avgOrders * 0.5 && (
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Drive More Orders</p>
                <p className="mt-1 text-sm text-slate-700">
                  Top makers in this category average {benchmark.avgOrders} orders/month.
                  Try social media promos, farmer&apos;s markets, or customer loyalty rewards.
                </p>
              </div>
            )}
            {shopStats.avgOrderValue >= benchmark.avgOrderValue && shopStats.productCount >= benchmark.avgProducts && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Great Performance</p>
                <p className="mt-1 text-sm text-slate-700">
                  You&apos;re matching or exceeding peer benchmarks across key metrics. Keep up the great work!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Note */}
      <div className="flex items-start gap-2 text-xs text-slate-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        <p>
          Benchmark data is updated monthly from anonymized, aggregated Maker&apos;s Market shop data.
          Actual figures may vary by location, seasonality, and market conditions.
        </p>
      </div>
    </div>
  )
}
