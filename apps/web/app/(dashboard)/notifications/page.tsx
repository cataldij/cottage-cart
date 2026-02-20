import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Bell, Clock3, ShoppingBag, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getNotificationData() {
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
    return { shop: null, orders: [] as any[] }
  }

  const { data: orders } = await supabase
    .from('shop_orders')
    .select('id, customer_name, customer_email, status, pickup_date, created_at')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return { shop, orders: orders || [] }
}

export default async function NotificationsPage() {
  const { shop, orders } = await getNotificationData()

  if (!shop) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Create your shop first to manage customer updates.
        </p>
        <Button asChild>
          <Link href="/builder">Create My Shop</Link>
        </Button>
      </div>
    )
  }

  const pending = orders.filter((order) => order.status === 'pending').length
  const ready = orders.filter((order) => order.status === 'ready').length
  const uniqueCustomers = new Set(orders.map((order) => order.customer_email)).size

  const templates = [
    'Your order is confirmed and we are baking now.',
    'Your order is ready for pickup. See you soon.',
    'Pickup window reminder: your order will be held until closing today.',
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Operational notification center for {shop.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ready}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{uniqueCustomers}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Customer Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template) => (
            <div
              key={template}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
            >
              {template}
            </div>
          ))}
          <p className="text-xs text-slate-500">
            Use these templates when messaging customers by email or phone from the
            <Link href="/messages" className="ml-1 text-amber-700 hover:underline">
              Messages page
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No order activity yet.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 8).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <div className="text-sm">
                    <p className="font-medium text-slate-900">{order.customer_name}</p>
                    <p className="text-slate-600">{order.customer_email}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 capitalize">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : 'No pickup date'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                      <Bell className="h-3.5 w-3.5" />
                      Update manually
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
