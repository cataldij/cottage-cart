'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Mail,
  MessageSquare,
  Phone,
  ShoppingBag,
  Loader2,
  Send,
  Megaphone,
  FileText,
  Plus,
  X,
  Check,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface CustomerThread {
  email: string
  name: string
  phone: string | null
  orderCount: number
  lastOrderAt: string
  lastOrderStatus: string
  lastOrderNotes: string | null
}

interface Broadcast {
  id: string
  subject: string
  body: string
  type: string
  sent_to_count: number
  created_at: string
}

interface Template {
  id: string
  name: string
  subject: string
  body: string
  type: string
}

type Tab = 'threads' | 'broadcasts' | 'templates'

export default function MessagesPage() {
  const [shopId, setShopId] = useState<string | null>(null)
  const [shopName, setShopName] = useState('')
  const [customers, setCustomers] = useState<CustomerThread[]>([])
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('threads')
  const [search, setSearch] = useState('')

  // Broadcast form
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [bcSubject, setBcSubject] = useState('')
  const [bcBody, setBcBody] = useState('')
  const [bcType, setBcType] = useState('announcement')
  const [sending, setSending] = useState(false)

  // Template form
  const [showTemplate, setShowTemplate] = useState(false)
  const [tplName, setTplName] = useState('')
  const [tplSubject, setTplSubject] = useState('')
  const [tplBody, setTplBody] = useState('')
  const [tplType, setTplType] = useState('custom')
  const [savingTpl, setSavingTpl] = useState(false)

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
    setShopName(shop.name)

    // Parallel queries
    const [ordersRes, broadcastsRes, templatesRes] = await Promise.all([
      supabase
        .from('shop_orders')
        .select('customer_name, customer_email, customer_phone, created_at, status, notes')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('message_broadcasts')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('message_templates')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false }),
    ])

    // Build customer threads
    const map = new Map<string, CustomerThread>()
    for (const order of ordersRes.data || []) {
      if (!order.customer_email) continue
      const existing = map.get(order.customer_email)
      if (existing) {
        existing.orderCount += 1
      } else {
        map.set(order.customer_email, {
          email: order.customer_email,
          name: order.customer_name || 'Customer',
          phone: order.customer_phone,
          orderCount: 1,
          lastOrderAt: order.created_at,
          lastOrderStatus: order.status,
          lastOrderNotes: order.notes,
        })
      }
    }

    setCustomers(Array.from(map.values()))
    setBroadcasts(broadcastsRes.data || [])
    setTemplates(templatesRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const sendBroadcast = async () => {
    if (!shopId || !bcSubject.trim() || !bcBody.trim()) return
    setSending(true)

    await supabase.from('message_broadcasts').insert({
      shop_id: shopId,
      subject: bcSubject,
      body: bcBody,
      type: bcType,
      sent_to_count: customers.length,
    })

    setSending(false)
    setShowBroadcast(false)
    setBcSubject('')
    setBcBody('')
    loadData()
  }

  const saveTemplate = async () => {
    if (!shopId || !tplName.trim() || !tplSubject.trim()) return
    setSavingTpl(true)

    await supabase.from('message_templates').insert({
      shop_id: shopId,
      name: tplName,
      subject: tplSubject,
      body: tplBody,
      type: tplType,
    })

    setSavingTpl(false)
    setShowTemplate(false)
    setTplName('')
    setTplSubject('')
    setTplBody('')
    loadData()
  }

  const deleteTemplate = async (id: string) => {
    await supabase.from('message_templates').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const applyTemplate = (template: Template) => {
    setBcSubject(template.subject)
    setBcBody(template.body)
    setBcType(template.type === 'custom' ? 'announcement' : template.type)
    setShowBroadcast(true)
    setTab('broadcasts')
  }

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

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
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Create your shop first to start communicating with customers.</p>
        <Button asChild><Link href="/builder">Create My Shop</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-500">Customer communications for {shopName}</p>
        </div>
        <Button
          className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
          onClick={() => {
            setShowBroadcast(true)
            setTab('broadcasts')
          }}
        >
          <Megaphone className="mr-1 h-4 w-4" />
          New Broadcast
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {([
          { key: 'threads', label: 'Customer Threads', icon: MessageSquare, count: customers.length },
          { key: 'broadcasts', label: 'Broadcasts', icon: Megaphone, count: broadcasts.length },
          { key: 'templates', label: 'Templates', icon: FileText, count: templates.length },
        ] as const).map(t => (
          <button
            key={t.key}
            className={cn(
              'flex items-center gap-2 rounded-t-xl px-4 py-2 text-sm font-medium transition-all',
              tab === t.key
                ? 'border-b-2 border-amber-700 text-amber-700'
                : 'text-slate-500 hover:text-slate-700'
            )}
            onClick={() => setTab(t.key)}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tab: Customer Threads */}
      {tab === 'threads' && (
        <>
          <div className="relative max-w-sm">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-base font-medium text-slate-700">No customer conversations yet</p>
              <p className="mt-1 text-sm text-slate-500">Customer contacts appear after orders start coming in.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map(customer => (
                <div key={customer.email} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{customer.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
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
                    <div className="text-right text-sm text-slate-600">
                      <p className="inline-flex items-center gap-1 font-medium text-slate-900">
                        <ShoppingBag className="h-4 w-4" />
                        {customer.orderCount} order{customer.orderCount === 1 ? '' : 's'}
                      </p>
                      <p className="mt-1">Last: {new Date(customer.lastOrderAt).toLocaleDateString()}</p>
                      <p className="capitalize">Status: {customer.lastOrderStatus.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {customer.lastOrderNotes && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">Latest order note</p>
                      <p className="mt-1">{customer.lastOrderNotes}</p>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
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
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Broadcasts */}
      {tab === 'broadcasts' && (
        <>
          {/* Broadcast form */}
          {showBroadcast && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">New Broadcast</h2>
                <button onClick={() => setShowBroadcast(false)}>
                  <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Send a message to all {customers.length} customer{customers.length !== 1 ? 's' : ''}
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <select
                    value={bcType}
                    onChange={e => setBcType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="promotion">Promotion / Sale</option>
                    <option value="new_product">New Product</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Subject</label>
                  <input
                    type="text"
                    value={bcSubject}
                    onChange={e => setBcSubject(e.target.value)}
                    placeholder="e.g., Fresh batch dropping this Saturday!"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Message</label>
                  <textarea
                    value={bcBody}
                    onChange={e => setBcBody(e.target.value)}
                    placeholder="Write your message to customers..."
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
                    disabled={sending || !bcSubject.trim() || !bcBody.trim()}
                    onClick={sendBroadcast}
                  >
                    {sending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                    Send to {customers.length} Customer{customers.length !== 1 ? 's' : ''}
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={() => setShowBroadcast(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Broadcast history */}
          {broadcasts.length === 0 && !showBroadcast ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-base font-medium text-slate-700">No broadcasts sent yet</p>
              <p className="mt-1 text-sm text-slate-500">Send announcements, promotions, and updates to all your customers</p>
              <Button
                className="mt-4 rounded-full bg-amber-700 text-white hover:bg-amber-800"
                onClick={() => setShowBroadcast(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Create Broadcast
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map(bc => (
                <div key={bc.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                          bc.type === 'promotion' ? 'bg-green-100 text-green-700' :
                          bc.type === 'new_product' ? 'bg-blue-100 text-blue-700' :
                          bc.type === 'reminder' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        )}>
                          {bc.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(bc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-slate-900">{bc.subject}</h3>
                      <p className="mt-1 text-sm text-slate-600">{bc.body}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Users className="h-3 w-3" />
                      {bc.sent_to_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Templates */}
      {tab === 'templates' && (
        <>
          {/* Template form */}
          {showTemplate && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">New Template</h2>
                <button onClick={() => setShowTemplate(false)}>
                  <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Template Name</label>
                  <input
                    type="text"
                    value={tplName}
                    onChange={e => setTplName(e.target.value)}
                    placeholder="e.g., Weekly Drop Announcement"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <select
                    value={tplType}
                    onChange={e => setTplType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="custom">Custom</option>
                    <option value="order_confirmation">Order Confirmation</option>
                    <option value="ready_pickup">Ready for Pickup</option>
                    <option value="thank_you">Thank You</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Subject Line</label>
                  <input
                    type="text"
                    value={tplSubject}
                    onChange={e => setTplSubject(e.target.value)}
                    placeholder="e.g., Fresh goods dropping this Saturday!"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Message Body</label>
                  <textarea
                    value={tplBody}
                    onChange={e => setTplBody(e.target.value)}
                    placeholder="Write template message..."
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
                  disabled={savingTpl || !tplName.trim() || !tplSubject.trim()}
                  onClick={saveTemplate}
                >
                  {savingTpl ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
                  Save Template
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => setShowTemplate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Template list */}
          {templates.length === 0 && !showTemplate ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-base font-medium text-slate-700">No message templates yet</p>
              <p className="mt-1 text-sm text-slate-500">Create reusable templates for common messages</p>
              <Button
                className="mt-4 rounded-full bg-amber-700 text-white hover:bg-amber-800"
                onClick={() => setShowTemplate(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Create Template
              </Button>
            </div>
          ) : (
            <>
              {!showTemplate && (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowTemplate(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New Template
                </Button>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {templates.map(tpl => (
                  <div key={tpl.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                          tpl.type === 'order_confirmation' ? 'bg-blue-100 text-blue-700' :
                          tpl.type === 'ready_pickup' ? 'bg-green-100 text-green-700' :
                          tpl.type === 'thank_you' ? 'bg-pink-100 text-pink-700' :
                          'bg-slate-100 text-slate-600'
                        )}>
                          {tpl.type.replace('_', ' ')}
                        </span>
                        <h3 className="mt-2 font-semibold text-slate-900">{tpl.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">Subject: {tpl.subject}</p>
                        {tpl.body && <p className="mt-1 text-xs text-slate-400 line-clamp-2">{tpl.body}</p>}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
                        onClick={() => applyTemplate(tpl)}
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-red-600 hover:bg-red-50"
                        onClick={() => deleteTemplate(tpl.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
