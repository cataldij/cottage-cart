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

async function getSettingsData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, is_public, accepting_orders, delivery_available, requires_preorder, delivery_fee, order_button_text, location_name, location_address, pickup_instructions')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!shops || shops.length === 0) {
    return { shop: null }
  }

  return { shop: shops[0] }
}

async function updateSettingsAction(id: string, formData: FormData) {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const deliveryFeeValue = formData.get('delivery_fee')?.toString().trim()

  const payload = {
    is_public: formData.get('is_public') === 'on',
    accepting_orders: formData.get('accepting_orders') === 'on',
    delivery_available: formData.get('delivery_available') === 'on',
    requires_preorder: formData.get('requires_preorder') === 'on',
    delivery_fee: deliveryFeeValue ? Number(deliveryFeeValue) : null,
    order_button_text: formData.get('order_button_text')?.toString().trim() || null,
    location_name: formData.get('location_name')?.toString().trim() || null,
    location_address: formData.get('location_address')?.toString().trim() || null,
    pickup_instructions: formData.get('pickup_instructions')?.toString().trim() || null,
  }

  const { error } = await supabase
    .from('shops')
    .update(payload)
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) throw new Error(error.message)
}

export default async function SettingsPage() {
  const { shop } = await getSettingsData()

  if (!shop) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Create your shop first to configure settings.</p>
        <Button asChild>
          <Link href="/builder">Create My Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure storefront visibility, order rules, and pickup details.
        </p>
      </div>

      <form action={updateSettingsAction.bind(null, shop.id)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Storefront</CardTitle>
            <CardDescription>Control how customers discover and order from your shop.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="is_public" defaultChecked={shop.is_public} />
              Public listing enabled
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="accepting_orders" defaultChecked={shop.accepting_orders} />
              Accepting orders
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="requires_preorder" defaultChecked={shop.requires_preorder} />
              Require pre-order
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fulfillment</CardTitle>
            <CardDescription>Set pickup and optional local delivery preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="delivery_available" defaultChecked={shop.delivery_available} />
              Offer delivery
            </label>
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery fee</label>
              <input
                name="delivery_fee"
                type="number"
                min="0"
                step="0.01"
                defaultValue={shop.delivery_fee ?? ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Order button label</label>
              <input
                name="order_button_text"
                type="text"
                defaultValue={shop.order_button_text ?? ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pickup location name</label>
              <input
                name="location_name"
                type="text"
                defaultValue={shop.location_name ?? ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pickup address</label>
              <input
                name="location_address"
                type="text"
                defaultValue={shop.location_address ?? ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pickup instructions</label>
              <textarea
                name="pickup_instructions"
                rows={4}
                defaultValue={shop.pickup_instructions ?? ''}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  )
}
