'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Search,
  Mail,
  Phone,
  ShoppingBag,
  UserRound,
  Star,
  StarOff,
  Loader2,
  StickyNote,
  X,
  Check,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Customer {
  email: string
  name: string
  phone: string | null
  orderCount: number
  totalSpent: number
  lastOrderAt: string
  isFavorite: boolean
  notes: string | null
  tags: string[]
}

export default function CustomersPage() {
  const [shopId, setShopId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [savingNote, setSavingNote] = useState(false)

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

    // Load orders and customer profiles in parallel
    const [ordersRes, profilesRes] = await Promise.all([
      supabase
        .from('shop_orders')
        .select('customer_name, customer_email, customer_phone, total, created_at, status')
        .eq('shop_id', shop.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false }),
      supabase
        .from('customer_profiles')
        .select('email, notes, is_favorite, tags')
        .eq('shop_id', shop.id),
    ])

    const orders = ordersRes.data || []
    const profiles = profilesRes.data || []

    // Build profile lookup
    const profileMap = new Map<string, { notes: string | null; is_favorite: boolean; tags: string[] }>()
    for (const p of profiles) {
      profileMap.set(p.email.toLowerCase(), { notes: p.notes, is_favorite: p.is_favorite, tags: p.tags || [] })
    }

    // Aggregate orders into customers
    const customerMap = new Map<string, Customer>()
    for (const order of orders) {
      if (!order.customer_email) continue
      const key = order.customer_email.toLowerCase()
      const existing = customerMap.get(key)
      const profile = profileMap.get(key)

      if (existing) {
        existing.orderCount += 1
        existing.totalSpent += Number(order.total || 0)
      } else {
        customerMap.set(key, {
          email: order.customer_email,
          name: order.customer_name || 'Customer',
          phone: order.customer_phone,
          orderCount: 1,
          totalSpent: Number(order.total || 0),
          lastOrderAt: order.created_at,
          isFavorite: profile?.is_favorite || false,
          notes: profile?.notes || null,
          tags: profile?.tags || [],
        })
      }
    }

    setCustomers(Array.from(customerMap.values()))
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const toggleFavorite = async (email: string, current: boolean) => {
    if (!shopId) return

    // Upsert customer profile
    await supabase
      .from('customer_profiles')
      .upsert({
        shop_id: shopId,
        email: email.toLowerCase(),
        is_favorite: !current,
        full_name: customers.find(c => c.email.toLowerCase() === email.toLowerCase())?.name,
      }, { onConflict: 'shop_id,email' })

    setCustomers(prev => prev.map(c =>
      c.email.toLowerCase() === email.toLowerCase() ? { ...c, isFavorite: !current } : c
    ))
  }

  const saveNotes = async (email: string) => {
    if (!shopId) return
    setSavingNote(true)

    await supabase
      .from('customer_profiles')
      .upsert({
        shop_id: shopId,
        email: email.toLowerCase(),
        notes: notesDraft || null,
        full_name: customers.find(c => c.email.toLowerCase() === email.toLowerCase())?.name,
      }, { onConflict: 'shop_id,email' })

    setCustomers(prev => prev.map(c =>
      c.email.toLowerCase() === email.toLowerCase() ? { ...c, notes: notesDraft || null } : c
    ))
    setEditingNotes(null)
    setNotesDraft('')
    setSavingNote(false)
  }

  // Filter & search
  let filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  if (filter === 'favorites') filtered = filtered.filter(c => c.isFavorite)
  if (filter === 'recent') filtered = filtered.sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime())
  if (filter === 'all') filtered = filtered.sort((a, b) => b.totalSpent - a.totalSpent)

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgSpend = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
  const repeatCustomers = customers.filter(c => c.orderCount > 1).length

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
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Create your shop first to start building a customer list.</p>
        <Button asChild><Link href="/builder">Create My Shop</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">Manage your customer relationships</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</p>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalCustomers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Repeat</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{repeatCustomers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Spend</p>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">${avgSpend.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Favorites</p>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{customers.filter(c => c.isFavorite).length}</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'favorites', 'recent'] as const).map(f => (
            <button
              key={f}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                filter === f ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'favorites' ? 'Favorites' : 'Recent'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <UserRound className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-base font-medium text-slate-700">
            {search ? 'No customers match your search' : 'No customers yet'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {search ? 'Try a different search term' : 'Customers appear here after your first orders.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(customer => (
            <article key={customer.email} className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Favorite toggle */}
                  <button
                    onClick={() => toggleFavorite(customer.email, customer.isFavorite)}
                    className="mt-0.5"
                  >
                    {customer.isFavorite ? (
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-5 w-5 text-slate-300 hover:text-yellow-400" />
                    )}
                  </button>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {customer.name}
                      {customer.isFavorite && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-800">
                          VIP
                        </span>
                      )}
                    </h2>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {customer.email}
                      </span>
                      {customer.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-sm text-slate-600">
                  <p className="inline-flex items-center gap-1 font-medium text-slate-900">
                    <ShoppingBag className="h-4 w-4" />
                    {customer.orderCount} order{customer.orderCount === 1 ? '' : 's'}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">${customer.totalSpent.toFixed(2)} spent</p>
                  <p className="text-xs text-slate-400">
                    Last: {new Date(customer.lastOrderAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Notes section */}
              {editingNotes === customer.email ? (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <textarea
                    value={notesDraft}
                    onChange={e => setNotesDraft(e.target.value)}
                    placeholder="Add notes about this customer..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
                      disabled={savingNote}
                      onClick={() => saveNotes(customer.email)}
                    >
                      {savingNote ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setEditingNotes(null)}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  {customer.notes ? (
                    <div
                      className="flex-1 cursor-pointer rounded-xl bg-slate-50 p-3 text-sm text-slate-700 transition hover:bg-slate-100"
                      onClick={() => {
                        setEditingNotes(customer.email)
                        setNotesDraft(customer.notes || '')
                      }}
                    >
                      <span className="font-medium text-slate-500">Notes: </span>
                      {customer.notes}
                    </div>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-amber-700"
                      onClick={() => {
                        setEditingNotes(customer.email)
                        setNotesDraft('')
                      }}
                    >
                      <StickyNote className="h-3 w-3" />
                      Add notes
                    </button>
                  )}

                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <a href={`mailto:${customer.email}`}>
                        <Mail className="mr-1 h-3 w-3" />
                        Email
                      </a>
                    </Button>
                    {customer.phone && (
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <a href={`tel:${customer.phone}`}>
                          <Phone className="mr-1 h-3 w-3" />
                          Call
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
