'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Store,
  UtensilsCrossed,
  Settings,
  Rocket,
  Check,
  ChevronRight,
  Loader2,
  ArrowLeft,
  ChefHat,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Step {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isComplete: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)
  const [shopName, setShopName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [productCount, setProductCount] = useState(0)
  const [hasSettings, setHasSettings] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  // Shop creation form
  const [formName, setFormName] = useState('')
  const [formTagline, setFormTagline] = useState('')
  const [formCategory, setFormCategory] = useState('bakery')

  const supabase: any = createClient()

  const loadStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: shop } = await supabase
      .from('shops')
      .select('id, name, slug, tagline, category, is_public, accepting_orders, location_name')
      .eq('created_by', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (shop) {
      setShopId(shop.id)
      setShopName(shop.name)
      setShopSlug(shop.slug)
      setIsPublic(shop.is_public)
      setHasSettings(!!shop.location_name || shop.accepting_orders)

      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shop.id)

      setProductCount(count || 0)
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadStatus() }, [loadStatus])

  const createShop = async () => {
    if (!formName.trim()) return
    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const slug = formName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const { data, error } = await supabase
      .from('shops')
      .insert({
        created_by: session.user.id,
        name: formName,
        slug,
        tagline: formTagline || null,
        category: formCategory,
        is_public: false,
        accepting_orders: false,
        primary_color: '#D97706',
        secondary_color: '#92400E',
        accent_color: '#F59E0B',
        button_color: '#D97706',
        button_text_color: '#FFFFFF',
        nav_color: '#FFFBEB',
        nav_text_color: '#78350F',
        font_heading: 'Playfair Display',
        font_body: 'DM Sans',
      })
      .select('id, name, slug')
      .single()

    if (data) {
      setShopId(data.id)
      setShopName(data.name)
      setShopSlug(data.slug)
    }

    setSaving(false)
  }

  const goLive = async () => {
    if (!shopId) return
    setSaving(true)

    await supabase
      .from('shops')
      .update({ is_public: true, accepting_orders: true })
      .eq('id', shopId)

    setIsPublic(true)
    setSaving(false)
  }

  const steps: Step[] = [
    {
      id: 'create',
      title: 'Create Your Shop',
      description: 'Name your shop and pick a category',
      icon: Store,
      isComplete: !!shopId,
    },
    {
      id: 'products',
      title: 'Add Products',
      description: 'List at least one product for sale',
      icon: UtensilsCrossed,
      isComplete: productCount > 0,
    },
    {
      id: 'customize',
      title: 'Customize & Design',
      description: 'Brand your storefront with colors and images',
      icon: Sparkles,
      isComplete: !!shopId,
    },
    {
      id: 'settings',
      title: 'Configure Settings',
      description: 'Set pickup location and order preferences',
      icon: Settings,
      isComplete: hasSettings,
    },
    {
      id: 'launch',
      title: 'Go Live!',
      description: 'Make your shop public and start selling',
      icon: Rocket,
      isComplete: isPublic,
    },
  ]

  const completedCount = steps.filter(s => s.isComplete).length
  const currentStep = steps.find(s => !s.isComplete) || steps[steps.length - 1]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  // All done!
  if (completedCount === steps.length) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg">
          <Check className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">You're Live!</h1>
          <p className="mt-2 text-slate-500">
            Your shop <strong>{shopName}</strong> is now public and accepting orders.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-left">
          <h3 className="font-semibold text-amber-800">Your Shop Link</h3>
          <p className="mt-1 text-xs text-amber-600">Share this with customers</p>
          <div className="mt-3 rounded-lg bg-white p-3 font-mono text-sm text-slate-700 break-all">
            cottage-cart.vercel.app/shop/{shopSlug}
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button asChild className="rounded-full bg-amber-700 text-white hover:bg-amber-800">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/shop/${shopSlug}`} target="_blank">View Storefront</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 text-white shadow-lg">
          <ChefHat className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Set Up Your Shop</h1>
        <p className="mt-2 text-slate-500">Complete these steps to start selling</p>
      </div>

      {/* Progress bar */}
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{completedCount} of {steps.length} complete</span>
          <span className="text-slate-400">{Math.round((completedCount / steps.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isCurrent = step.id === currentStep.id
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className={cn(
                'rounded-2xl border p-5 transition-all',
                step.isComplete
                  ? 'border-green-200 bg-green-50/50'
                  : isCurrent
                    ? 'border-amber-300 bg-white shadow-md'
                    : 'border-slate-200 bg-white opacity-60'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  step.isComplete
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-400'
                )}>
                  {step.isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'font-semibold',
                    step.isComplete ? 'text-green-800' : isCurrent ? 'text-slate-900' : 'text-slate-500'
                  )}>
                    {step.title}
                  </p>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
                {step.isComplete && (
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Done</span>
                )}
              </div>

              {/* Step-specific content */}
              {isCurrent && step.id === 'create' && !shopId && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Shop Name *</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="e.g., Sweet Mama's Kitchen"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Category</label>
                      <select
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="bakery">Bakery</option>
                        <option value="preserves">Preserves & Jams</option>
                        <option value="sauces">Sauces & Condiments</option>
                        <option value="snacks">Snacks & Treats</option>
                        <option value="beverages">Beverages</option>
                        <option value="pet_treats">Pet Treats</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Tagline</label>
                      <input
                        type="text"
                        value={formTagline}
                        onChange={e => setFormTagline(e.target.value)}
                        placeholder="e.g., Fresh-baked goodness from my kitchen to yours"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4 rounded-full bg-amber-700 text-white hover:bg-amber-800"
                    disabled={saving || !formName.trim()}
                    onClick={createShop}
                  >
                    {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Store className="mr-1 h-4 w-4" />}
                    Create Shop
                  </Button>
                </div>
              )}

              {isCurrent && step.id === 'products' && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-sm text-slate-600">
                    You have <strong>{productCount}</strong> product{productCount !== 1 ? 's' : ''}.
                    {productCount === 0 ? ' Add your first product to continue.' : ' Add more or continue to the next step.'}
                  </p>
                  <Button asChild className="mt-3 rounded-full bg-amber-700 text-white hover:bg-amber-800">
                    <Link href="/products">
                      <UtensilsCrossed className="mr-1 h-4 w-4" />
                      {productCount === 0 ? 'Add Your First Product' : 'Manage Products'}
                    </Link>
                  </Button>
                </div>
              )}

              {isCurrent && step.id === 'customize' && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-sm text-slate-600">
                    Personalize your storefront with colors, fonts, hero images, and layout.
                  </p>
                  <Button asChild className="mt-3 rounded-full bg-amber-700 text-white hover:bg-amber-800">
                    <Link href="/builder">
                      <Sparkles className="mr-1 h-4 w-4" />
                      Open Shop Designer
                    </Link>
                  </Button>
                </div>
              )}

              {isCurrent && step.id === 'settings' && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-sm text-slate-600">
                    Set your pickup location, delivery options, and order preferences.
                  </p>
                  <Button asChild className="mt-3 rounded-full bg-amber-700 text-white hover:bg-amber-800">
                    <Link href="/settings">
                      <Settings className="mr-1 h-4 w-4" />
                      Configure Settings
                    </Link>
                  </Button>
                </div>
              )}

              {isCurrent && step.id === 'launch' && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="text-sm text-slate-600">
                    Your shop is ready! Click below to make it public and start accepting orders.
                  </p>
                  <Button
                    className="mt-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:from-green-700 hover:to-emerald-700"
                    disabled={saving}
                    onClick={goLive}
                  >
                    {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Rocket className="mr-1 h-4 w-4" />}
                    Go Live!
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Skip link */}
      <div className="text-center">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-600">
          Skip setup and go to dashboard
        </Link>
      </div>
    </div>
  )
}
