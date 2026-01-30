import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket } from 'lucide-react'

async function getTicketData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return { conference: null, members: [], ticketTypes: [], orders: [] }
  }

  const conferenceId = conferences[0].id

  const { data: members } = await supabase
    .from('conference_members')
    .select('ticket_type, ticket_code, checked_in')
    .eq('conference_id', conferenceId)

  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('id, name, price_cents, currency, sold_count, max_quantity')
    .eq('conference_id', conferenceId)
    .order('created_at', { ascending: false })

  const { data: orders } = await supabase
    .from('orders')
    .select(
      `id, amount_cents, currency, status, created_at, completed_at,
      ticket_type:ticket_types(name),
      buyer:profiles(full_name, email)`
    )
    .eq('conference_id', conferenceId)
    .order('created_at', { ascending: false })
    .limit(25)

  return {
    conference: conferences[0],
    members: members || [],
    ticketTypes: ticketTypes || [],
    orders: orders || [],
  }
}

export default async function TicketsPage() {
  const { conference, members, ticketTypes, orders } = await getTicketData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  const totalTickets = members.filter((m) => m.ticket_code).length
  const checkedIn = members.filter((m) => m.checked_in).length

  const byType = members.reduce<Record<string, number>>((acc, m) => {
    const key = m.ticket_type || 'general'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const completedOrders = orders.filter((order) => order.status === 'completed')
  const refundedOrders = orders.filter((order) => order.status === 'refunded')
  const grossRevenueCents = completedOrders.reduce(
    (sum, order) => sum + (order.amount_cents || 0),
    0
  )
  const avgOrderValueCents =
    completedOrders.length > 0 ? Math.round(grossRevenueCents / completedOrders.length) : 0
  const currency = completedOrders[0]?.currency || 'usd'

  const revenueByType = completedOrders.reduce<Record<string, number>>((acc, order) => {
    const key = order.ticket_type?.name || 'General'
    acc[key] = (acc[key] || 0) + (order.amount_cents || 0)
    return acc
  }, {})

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(value / 100)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        <p className="text-muted-foreground">
          Ticket distribution for {conference.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Issued</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(grossRevenueCents)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {refundedOrders.length} refunded
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Types</CardTitle>
            <CardDescription>Sales progress and revenue by ticket.</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ticket types yet.</p>
            ) : (
              <div className="space-y-3">
                {ticketTypes.map((ticket) => {
                  const sold = ticket.sold_count || 0
                  const max = ticket.max_quantity || null
                  const percent = max ? Math.round((sold / max) * 100) : null
                  const revenue = revenueByType[ticket.name] || 0

                  return (
                    <div
                      key={ticket.id}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{ticket.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(ticket.price_cents)} per ticket
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{sold} sold</p>
                          <p>{formatCurrency(revenue)} revenue</p>
                        </div>
                      </div>
                      {max && (
                        <div className="mt-3 h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(percent || 0, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              {completedOrders.length} completed • Avg order {formatCurrency(avgOrderValueCents)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {order.buyer?.full_name || order.buyer?.email || 'Guest'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.ticket_type?.name || 'General admission'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(order.amount_cents || 0)}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
