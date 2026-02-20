import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Mail, Phone, ShoppingBag, UserRound } from 'lucide-react'

interface CustomerSummary {
  name: string
  email: string
  phone: string | null
  orderCount: number
  totalSpent: number
  lastOrderAt: string
}

async function getCustomerData(): Promise<{ shop: { id: string; name: string } | null; customers: CustomerSummary[] }> {
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
    .select('customer_name, customer_email, customer_phone, total, created_at')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })

  const customerMap = new Map<string, CustomerSummary>()

  for (const order of orders || []) {
    if (!order.customer_email) continue
    const key = order.customer_email.toLowerCase()
    const current = customerMap.get(key)

    if (current) {
      current.orderCount += 1
      current.totalSpent += Number(order.total || 0)
      continue
    }

    customerMap.set(key, {
      name: order.customer_name || 'Customer',
      email: order.customer_email,
      phone: order.customer_phone,
      orderCount: 1,
      totalSpent: Number(order.total || 0),
      lastOrderAt: order.created_at,
    })
  }

  return {
    shop,
    customers: Array.from(customerMap.values()),
  }
}

export default async function CustomersPage() {
  const { shop, customers } = await getCustomerData()

  if (!shop) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Create your shop first to start building a customer list.</p>
        <Button asChild>
          <Link href="/builder">Create My Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Your customer list from orders placed at {shop.name}.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <UserRound className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-base font-medium text-slate-700">No customers yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Customers appear here after your first orders.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <article key={customer.email} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{customer.name}</h2>
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
                <div className="text-right text-sm text-slate-600">
                  <p className="inline-flex items-center gap-1 font-medium text-slate-900">
                    <ShoppingBag className="h-4 w-4" />
                    {customer.orderCount} order{customer.orderCount === 1 ? '' : 's'}
                  </p>
                  <p className="mt-1">Spent: ${customer.totalSpent.toFixed(2)}</p>
                  <p>Last order: {new Date(customer.lastOrderAt).toLocaleDateString()}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
