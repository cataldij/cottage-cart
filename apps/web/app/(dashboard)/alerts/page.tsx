'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Package,
  DollarSign,
  Loader2,
  Check,
  Plus,
  Trash2,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface IngredientAlert {
  id: string
  ingredient_name: string
  alert_type: string
  previous_price: number | null
  current_price: number | null
  change_percent: number | null
  unit: string | null
  is_read: boolean
  created_at: string
}

interface WatchItem {
  name: string
  currentPrice: number
  unit: string
}

const COMMON_INGREDIENTS = [
  { name: 'All-Purpose Flour', unit: '5 lb bag', avgPrice: 4.29 },
  { name: 'Butter', unit: 'lb', avgPrice: 5.49 },
  { name: 'Granulated Sugar', unit: '4 lb bag', avgPrice: 3.99 },
  { name: 'Brown Sugar', unit: '2 lb bag', avgPrice: 3.49 },
  { name: 'Eggs', unit: 'dozen', avgPrice: 3.99 },
  { name: 'Vanilla Extract', unit: '2 oz', avgPrice: 7.99 },
  { name: 'Chocolate Chips', unit: '12 oz bag', avgPrice: 3.49 },
  { name: 'Cocoa Powder', unit: '8 oz', avgPrice: 4.99 },
  { name: 'Baking Powder', unit: '8.1 oz', avgPrice: 2.99 },
  { name: 'Baking Soda', unit: '16 oz', avgPrice: 1.29 },
  { name: 'Heavy Cream', unit: 'pint', avgPrice: 4.49 },
  { name: 'Cream Cheese', unit: '8 oz', avgPrice: 2.99 },
  { name: 'Pecans', unit: 'lb', avgPrice: 12.99 },
  { name: 'Walnuts', unit: 'lb', avgPrice: 9.99 },
  { name: 'Strawberries', unit: 'lb', avgPrice: 3.99 },
  { name: 'Blueberries', unit: 'pint', avgPrice: 4.49 },
  { name: 'Lemons', unit: 'each', avgPrice: 0.79 },
  { name: 'Honey', unit: '12 oz', avgPrice: 6.99 },
  { name: 'Maple Syrup', unit: '12 oz', avgPrice: 8.99 },
  { name: 'Powdered Sugar', unit: '2 lb bag', avgPrice: 2.99 },
]

export default function AlertsPage() {
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<IngredientAlert[]>([])
  const [showAddWatchlist, setShowAddWatchlist] = useState(false)
  const [watchlist, setWatchlist] = useState<WatchItem[]>([])
  const [customIngredient, setCustomIngredient] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customUnit, setCustomUnit] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'price_increase' | 'price_decrease'>('all')

  const supabase: any = createClient()

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!shop) {
      setLoading(false)
      return
    }

    setShopId(shop.id)

    const { data: alertData } = await supabase
      .from('ingredient_alerts')
      .select('*')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })

    setAlerts(alertData || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const markRead = async (id: string) => {
    await supabase
      .from('ingredient_alerts')
      .update({ is_read: true })
      .eq('id', id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
  }

  const markAllRead = async () => {
    if (!shopId) return
    await supabase
      .from('ingredient_alerts')
      .update({ is_read: true })
      .eq('shop_id', shopId)
      .eq('is_read', false)
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
  }

  const deleteAlert = async (id: string) => {
    await supabase
      .from('ingredient_alerts')
      .delete()
      .eq('id', id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const addToWatchlist = (name: string, price: number, unit: string) => {
    if (watchlist.find(w => w.name === name)) return
    setWatchlist(prev => [...prev, { name, currentPrice: price, unit }])
  }

  const addCustomIngredient = () => {
    if (!customIngredient.trim() || !customPrice) return
    addToWatchlist(customIngredient.trim(), Number(customPrice), customUnit || 'unit')
    setCustomIngredient('')
    setCustomPrice('')
    setCustomUnit('')
  }

  const removeFromWatchlist = (name: string) => {
    setWatchlist(prev => prev.filter(w => w.name !== name))
  }

  // Simulate price alerts from watchlist (in production, this would be a cron job)
  const simulatePriceCheck = async () => {
    if (!shopId || watchlist.length === 0) return

    const newAlerts: any[] = []
    for (const item of watchlist) {
      // Simulate small price fluctuations (-10% to +15%)
      const change = (Math.random() - 0.4) * 25
      const newPrice = Math.round(item.currentPrice * (1 + change / 100) * 100) / 100

      if (Math.abs(change) > 3) {
        newAlerts.push({
          shop_id: shopId,
          ingredient_name: item.name,
          alert_type: change > 0 ? 'price_increase' : 'price_decrease',
          previous_price: item.currentPrice,
          current_price: newPrice,
          change_percent: Math.round(change * 10) / 10,
          unit: item.unit,
          is_read: false,
        })
      }
    }

    if (newAlerts.length > 0) {
      const { data } = await supabase
        .from('ingredient_alerts')
        .insert(newAlerts)
        .select()
      if (data) {
        setAlerts(prev => [...data, ...prev])
      }
    }
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.is_read
    if (filter === 'price_increase') return a.alert_type === 'price_increase'
    if (filter === 'price_decrease') return a.alert_type === 'price_decrease'
    return true
  })

  const unreadCount = alerts.filter(a => !a.is_read).length
  const increaseCount = alerts.filter(a => a.alert_type === 'price_increase').length
  const decreaseCount = alerts.filter(a => a.alert_type === 'price_decrease').length

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
        <h1 className="text-3xl font-bold tracking-tight">Ingredient Alerts</h1>
        <p className="text-muted-foreground">Create your shop first to track ingredient prices.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Bell className="h-6 w-6 text-amber-600" />
            Ingredient Price Alerts
          </h1>
          <p className="text-sm text-slate-500">
            Track ingredient costs and get notified of price changes
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs"
              onClick={markAllRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
          <Button
            size="sm"
            className="rounded-full bg-amber-700 text-xs text-white hover:bg-amber-800"
            onClick={() => setShowAddWatchlist(!showAddWatchlist)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Watch Ingredients
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Alerts</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{alerts.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Unread</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{unreadCount}</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Price Increases</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{increaseCount}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Price Drops</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{decreaseCount}</p>
        </div>
      </div>

      {/* Watchlist Panel */}
      {showAddWatchlist && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-bold text-slate-900">Ingredient Watchlist</h3>
          <p className="text-xs text-slate-500">Select ingredients to monitor for price changes</p>

          {/* Current watchlist */}
          {watchlist.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {watchlist.map(w => (
                <span
                  key={w.name}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  {w.name} — ${w.currentPrice}/{w.unit}
                  <button onClick={() => removeFromWatchlist(w.name)} className="ml-1 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Common ingredients grid */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {COMMON_INGREDIENTS.map(ing => {
              const isWatched = watchlist.find(w => w.name === ing.name)
              return (
                <button
                  key={ing.name}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition',
                    isWatched
                      ? 'border-amber-400 bg-amber-100 text-amber-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                  )}
                  onClick={() => isWatched ? removeFromWatchlist(ing.name) : addToWatchlist(ing.name, ing.avgPrice, ing.unit)}
                >
                  <div>
                    <p className="font-medium">{ing.name}</p>
                    <p className="text-[10px] text-slate-400">{ing.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${ing.avgPrice.toFixed(2)}</p>
                    {isWatched && <Check className="ml-auto h-3 w-3 text-amber-600" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Custom ingredient */}
          <div className="mt-4 flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Custom Ingredient</label>
              <input
                value={customIngredient}
                onChange={e => setCustomIngredient(e.target.value)}
                placeholder="Ingredient name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-slate-600">Price</label>
              <input
                type="number"
                step="0.01"
                value={customPrice}
                onChange={e => setCustomPrice(e.target.value)}
                placeholder="$0.00"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-slate-600">Unit</label>
              <input
                value={customUnit}
                onChange={e => setCustomUnit(e.target.value)}
                placeholder="lb, oz..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <Button
              size="sm"
              className="rounded-xl bg-amber-700 text-white hover:bg-amber-800"
              onClick={addCustomIngredient}
              disabled={!customIngredient.trim() || !customPrice}
            >
              Add
            </Button>
          </div>

          {/* Check prices button */}
          {watchlist.length > 0 && (
            <Button
              className="mt-4 gap-2 rounded-xl bg-amber-700 text-white hover:bg-amber-800"
              onClick={simulatePriceCheck}
            >
              <DollarSign className="h-4 w-4" />
              Check Prices Now
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'unread', 'price_increase', 'price_decrease'] as const).map(f => (
          <button
            key={f}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              filter === f ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${alerts.length})`
              : f === 'unread' ? `Unread (${unreadCount})`
                : f === 'price_increase' ? `Increases (${increaseCount})`
                  : `Drops (${decreaseCount})`}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              {alerts.length === 0 ? 'No alerts yet' : 'No alerts match this filter'}
            </p>
            <p className="text-xs text-slate-400">
              {alerts.length === 0
                ? 'Add ingredients to your watchlist and check prices to get started'
                : 'Try a different filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map(alert => {
              const isIncrease = alert.alert_type === 'price_increase'
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 transition',
                    !alert.is_read ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-white'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    isIncrease ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  )}>
                    {isIncrease ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{alert.ingredient_name}</p>
                      {!alert.is_read && (
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {alert.previous_price && alert.current_price
                        ? `$${alert.previous_price.toFixed(2)} → $${alert.current_price.toFixed(2)}`
                        : isIncrease ? 'Price increased' : 'Price decreased'}
                      {alert.unit ? ` per ${alert.unit}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-bold',
                      isIncrease ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    )}>
                      {isIncrease ? '+' : ''}{alert.change_percent?.toFixed(1)}%
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!alert.is_read && (
                      <button
                        onClick={() => markRead(alert.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="font-semibold text-blue-800">Price Tracking Tips</p>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>Add your most-used ingredients to the watchlist to spot price trends</li>
          <li>Buy in bulk when prices dip — check the drops filter for opportunities</li>
          <li>Use the <Link href="/calculator" className="font-semibold underline">Price Calculator</Link> to see how ingredient cost changes affect your margins</li>
          <li>Seasonal ingredients often have predictable price cycles</li>
        </ul>
      </div>
    </div>
  )
}
