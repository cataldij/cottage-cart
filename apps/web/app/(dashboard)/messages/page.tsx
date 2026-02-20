import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Phone, ShoppingBag } from 'lucide-react'

interface CustomerThread {
  email: string
  name: string
  phone: string | null
  orderCount: number
  lastOrderAt: string
  lastOrderStatus: string
  lastOrderNotes: string | null
}

async function getMessagesData(): Promise<{ shop: { id: string; name: string } | null; customers: CustomerThread[] }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!shop) {
    return { shop: null, customers: [] }
  }

  const { data: orders } = await supabase
    .from('shop_orders')
    .select('customer_name, customer_email, customer_phone, created_at, status, notes')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  const map = new Map<string, CustomerThread>()

  for (const order of orders || []) {
    if (!order.customer_email) continue

    const existing = map.get(order.customer_email)
    if (existing) {
      existing.orderCount += 1
      continue
    }

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

  return {
    shop,
    customers: Array.from(map.values()),
  }
}

export default async function MessagesPage() {
  const { shop, customers } = await getMessagesData()

  if (!shop) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Create your shop first to start communicating with customers.
          </p>
        </div>
        <Button asChild>
          <Link href="/builder">Create My Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Customer contact details and recent order notes for {shop.name}.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-base font-medium text-slate-700">No customer conversations yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Customer contacts appear here after orders start coming in.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <div
              key={customer.email}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
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
                  <p className="mt-1">
                    Last order: {new Date(customer.lastOrderAt).toLocaleDateString()}
                  </p>
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
                <Button asChild size="sm" variant="outline">
                  <a href={`mailto:${customer.email}`}>Email Customer</a>
                </Button>
                {customer.phone && (
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${customer.phone}`}>Call Customer</a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
