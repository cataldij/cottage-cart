'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Leaf,
  Loader2,
  Recycle,
  Sun,
  Droplets,
  MapPin,
  Package,
  Trash2,
  Zap,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  ArrowUpRight,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  price: number
}

interface SustainabilityData {
  product_id: string
  product_name: string
  overall_score: number
  local_sourcing_score: number
  packaging_score: number
  waste_score: number
  energy_score: number
  local_ingredients_pct: number
  packaging_type: string
  food_waste_pct: number
  uses_renewable_energy: boolean
  notes: string
}

const PACKAGING_OPTIONS = [
  { value: 'compostable', label: 'Compostable', score: 100, icon: Leaf },
  { value: 'reusable', label: 'Reusable', score: 90, icon: Recycle },
  { value: 'recyclable', label: 'Recyclable', score: 70, icon: Recycle },
  { value: 'mixed', label: 'Mixed Materials', score: 40, icon: Package },
  { value: 'plastic', label: 'Plastic', score: 15, icon: Package },
]

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-700'
  if (score >= 60) return 'text-emerald-600'
  if (score >= 40) return 'text-amber-600'
  if (score >= 20) return 'text-orange-600'
  return 'text-red-600'
}

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-emerald-500'
  if (score >= 40) return 'bg-amber-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

const getGrade = (score: number) => {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C+'
  if (score >= 40) return 'C'
  if (score >= 30) return 'D'
  return 'F'
}

export default function SustainabilityPage() {
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [scores, setScores] = useState<Map<string, SustainabilityData>>(new Map())
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  // Editable fields per product
  const [editForms, setEditForms] = useState<Map<string, SustainabilityData>>(new Map())

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

    setShopId(shop.id)

    const [productsRes, scoresRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, price')
        .eq('shop_id', shop.id)
        .order('name'),
      supabase
        .from('product_sustainability')
        .select('*')
        .eq('shop_id', shop.id),
    ])

    setProducts(productsRes.data || [])

    const scoreMap = new Map<string, SustainabilityData>()
    for (const s of scoresRes.data || []) {
      scoreMap.set(s.product_id, s)
    }
    setScores(scoreMap)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getOrCreateForm = (product: Product): SustainabilityData => {
    const existing = editForms.get(product.id)
    if (existing) return existing

    const saved = scores.get(product.id)
    if (saved) return { ...saved }

    return {
      product_id: product.id,
      product_name: product.name,
      overall_score: 0,
      local_sourcing_score: 50,
      packaging_score: 40,
      waste_score: 50,
      energy_score: 30,
      local_ingredients_pct: 50,
      packaging_type: 'mixed',
      food_waste_pct: 10,
      uses_renewable_energy: false,
      notes: '',
    }
  }

  const updateForm = (productId: string, updates: Partial<SustainabilityData>) => {
    const current = getOrCreateForm(products.find(p => p.id === productId)!)
    const updated = { ...current, ...updates }

    // Recalculate scores
    updated.local_sourcing_score = updated.local_ingredients_pct
    const pkgOption = PACKAGING_OPTIONS.find(p => p.value === updated.packaging_type)
    updated.packaging_score = pkgOption?.score || 40
    updated.waste_score = Math.max(0, 100 - (updated.food_waste_pct * 2))
    updated.energy_score = updated.uses_renewable_energy ? 100 : 30

    // Overall = weighted average
    updated.overall_score = Math.round(
      updated.local_sourcing_score * 0.30 +
      updated.packaging_score * 0.25 +
      updated.waste_score * 0.25 +
      updated.energy_score * 0.20
    )

    setEditForms(prev => new Map(prev).set(productId, updated))
  }

  const saveScore = async (productId: string) => {
    if (!shopId) return
    setSaving(productId)

    const form = editForms.get(productId) || getOrCreateForm(products.find(p => p.id === productId)!)

    const { error } = await supabase
      .from('product_sustainability')
      .upsert({
        shop_id: shopId,
        product_id: productId,
        product_name: form.product_name,
        overall_score: form.overall_score,
        local_sourcing_score: form.local_sourcing_score,
        packaging_score: form.packaging_score,
        waste_score: form.waste_score,
        energy_score: form.energy_score,
        local_ingredients_pct: form.local_ingredients_pct,
        packaging_type: form.packaging_type,
        food_waste_pct: form.food_waste_pct,
        uses_renewable_energy: form.uses_renewable_energy,
        notes: form.notes,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'shop_id,product_id' })

    if (!error) {
      setScores(prev => new Map(prev).set(productId, form))
      setSaved(productId)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Sustainability</h1>
        <p className="text-muted-foreground">Create your shop first to track sustainability.</p>
      </div>
    )
  }

  // Compute overall shop score
  const allScores = Array.from(scores.values())
  const shopOverall = allScores.length > 0
    ? Math.round(allScores.reduce((s, v) => s + v.overall_score, 0) / allScores.length)
    : 0
  const scoredCount = allScores.length
  const unscoredCount = products.length - scoredCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Leaf className="h-6 w-6 text-green-600" />
          Sustainability Score
        </h1>
        <p className="text-sm text-slate-500">
          Track and improve the environmental impact of your products
        </p>
      </div>

      {/* Shop Overall Score */}
      <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
        <div className="flex items-center gap-6">
          <div className={cn(
            'flex h-24 w-24 flex-col items-center justify-center rounded-3xl',
            shopOverall >= 60 ? 'bg-green-100' : shopOverall >= 30 ? 'bg-amber-100' : 'bg-slate-100'
          )}>
            <span className={cn('text-3xl font-black', getScoreColor(shopOverall))}>
              {scoredCount > 0 ? getGrade(shopOverall) : '—'}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {scoredCount > 0 ? `${shopOverall}/100` : 'No data'}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Shop Sustainability Score</h2>
            <p className="text-sm text-slate-500">
              {scoredCount > 0
                ? `Based on ${scoredCount} product${scoredCount !== 1 ? 's' : ''} scored`
                : 'Score your products below to see your shop rating'}
            </p>
            {unscoredCount > 0 && (
              <p className="mt-1 text-xs text-amber-600">
                {unscoredCount} product{unscoredCount !== 1 ? 's' : ''} not yet scored
              </p>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        {scoredCount > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Local Sourcing', value: Math.round(allScores.reduce((s, v) => s + v.local_sourcing_score, 0) / scoredCount), icon: MapPin },
              { label: 'Packaging', value: Math.round(allScores.reduce((s, v) => s + v.packaging_score, 0) / scoredCount), icon: Package },
              { label: 'Food Waste', value: Math.round(allScores.reduce((s, v) => s + v.waste_score, 0) / scoredCount), icon: Trash2 },
              { label: 'Energy', value: Math.round(allScores.reduce((s, v) => s + v.energy_score, 0) / scoredCount), icon: Zap },
            ].map(cat => (
              <div key={cat.label} className="rounded-xl bg-white/80 p-3">
                <div className="flex items-center gap-1.5">
                  <cat.icon className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{cat.label}</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full transition-all', getScoreBg(cat.value))} style={{ width: `${cat.value}%` }} />
                  </div>
                  <span className={cn('text-xs font-bold', getScoreColor(cat.value))}>{cat.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Scores */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Product Sustainability</h2>
        <p className="text-xs text-slate-400">Score each product to build your shop rating</p>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Leaf className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No products yet</p>
            <p className="text-xs text-slate-400">Add products to your shop to start scoring</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {products.map(product => {
              const score = scores.get(product.id)
              const form = editForms.get(product.id) || (score ? { ...score } : null)
              const isExpanded = expandedProduct === product.id

              return (
                <div key={product.id} className="rounded-xl border border-slate-100 transition hover:border-slate-200">
                  {/* Product Header */}
                  <button
                    className="flex w-full items-center gap-3 p-4"
                    onClick={() => {
                      setExpandedProduct(isExpanded ? null : product.id)
                      if (!editForms.has(product.id)) {
                        updateForm(product.id, {})
                      }
                    }}
                  >
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      score ? (score.overall_score >= 60 ? 'bg-green-100' : score.overall_score >= 30 ? 'bg-amber-100' : 'bg-red-100') : 'bg-slate-100'
                    )}>
                      {score ? (
                        <span className={cn('text-sm font-black', getScoreColor(score.overall_score))}>
                          {getGrade(score.overall_score)}
                        </span>
                      ) : (
                        <Leaf className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="font-medium text-slate-900">{product.name}</p>
                      {score ? (
                        <p className="text-xs text-slate-500">Score: {score.overall_score}/100</p>
                      ) : (
                        <p className="text-xs text-amber-600">Not scored yet — click to rate</p>
                      )}
                    </div>
                    {score && (
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={cn('h-full rounded-full transition-all', getScoreBg(score.overall_score))}
                            style={{ width: `${score.overall_score}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {/* Expanded Form */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4">
                      {(() => {
                        const f = getOrCreateForm(product)
                        const currentForm = editForms.get(product.id) || f

                        return (
                          <div className="space-y-5">
                            {/* Local Sourcing */}
                            <div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                <label className="text-sm font-semibold text-slate-700">
                                  Local Ingredients: {currentForm.local_ingredients_pct}%
                                </label>
                              </div>
                              <p className="ml-6 text-xs text-slate-400">What percentage of ingredients are locally sourced (within 100 miles)?</p>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={currentForm.local_ingredients_pct}
                                onChange={e => updateForm(product.id, { local_ingredients_pct: Number(e.target.value) })}
                                className="ml-6 mt-2 h-2 w-full max-w-sm cursor-pointer appearance-none rounded-full bg-green-100 accent-green-600"
                              />
                            </div>

                            {/* Packaging */}
                            <div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-600" />
                                <label className="text-sm font-semibold text-slate-700">Packaging Type</label>
                              </div>
                              <div className="ml-6 mt-2 flex flex-wrap gap-2">
                                {PACKAGING_OPTIONS.map(opt => (
                                  <button
                                    key={opt.value}
                                    className={cn(
                                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
                                      currentForm.packaging_type === opt.value
                                        ? 'bg-green-700 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    )}
                                    onClick={() => updateForm(product.id, { packaging_type: opt.value })}
                                  >
                                    <opt.icon className="h-3 w-3" />
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Food Waste */}
                            <div>
                              <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4 text-orange-600" />
                                <label className="text-sm font-semibold text-slate-700">
                                  Estimated Waste: {currentForm.food_waste_pct}%
                                </label>
                              </div>
                              <p className="ml-6 text-xs text-slate-400">What percentage of ingredients typically go to waste during production?</p>
                              <input
                                type="range"
                                min={0}
                                max={50}
                                step={1}
                                value={currentForm.food_waste_pct}
                                onChange={e => updateForm(product.id, { food_waste_pct: Number(e.target.value) })}
                                className="ml-6 mt-2 h-2 w-full max-w-sm cursor-pointer appearance-none rounded-full bg-orange-100 accent-orange-600"
                              />
                            </div>

                            {/* Energy */}
                            <div>
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-600" />
                                <label className="text-sm font-semibold text-slate-700">Renewable Energy</label>
                              </div>
                              <div className="ml-6 mt-2">
                                <button
                                  className={cn(
                                    'relative inline-flex h-6 w-11 items-center rounded-full transition',
                                    currentForm.uses_renewable_energy ? 'bg-green-600' : 'bg-slate-300'
                                  )}
                                  onClick={() => updateForm(product.id, { uses_renewable_energy: !currentForm.uses_renewable_energy })}
                                >
                                  <span className={cn(
                                    'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                                    currentForm.uses_renewable_energy ? 'translate-x-6' : 'translate-x-1'
                                  )} />
                                </button>
                                <span className="ml-2 text-xs text-slate-500">
                                  {currentForm.uses_renewable_energy ? 'Yes — solar, wind, or other renewable' : 'No — grid power'}
                                </span>
                              </div>
                            </div>

                            {/* Score Preview + Save */}
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'flex h-12 w-12 items-center justify-center rounded-xl',
                                  currentForm.overall_score >= 60 ? 'bg-green-100' : currentForm.overall_score >= 30 ? 'bg-amber-100' : 'bg-red-100'
                                )}>
                                  <span className={cn('text-lg font-black', getScoreColor(currentForm.overall_score))}>
                                    {getGrade(currentForm.overall_score)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">Score: {currentForm.overall_score}/100</p>
                                  <p className="text-[10px] text-slate-400">
                                    Local: {currentForm.local_sourcing_score} | Packaging: {currentForm.packaging_score} | Waste: {currentForm.waste_score} | Energy: {currentForm.energy_score}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="gap-1 rounded-xl bg-green-700 text-white hover:bg-green-800"
                                onClick={() => saveScore(product.id)}
                                disabled={saving === product.id}
                              >
                                {saving === product.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : saved === product.id ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                                {saved === product.id ? 'Saved!' : 'Save Score'}
                              </Button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
        <p className="font-semibold text-green-800">Improve Your Score</p>
        <ul className="mt-2 space-y-1 text-sm text-green-700">
          <li><strong>Local sourcing:</strong> Buy from farmer&apos;s markets, local farms, and regional suppliers within 100 miles</li>
          <li><strong>Packaging:</strong> Switch to compostable bags, paper boxes, or offer reusable container programs</li>
          <li><strong>Waste:</strong> Use scraps creatively (e.g., cookie crumbles become pie crust), compost what you can&apos;t use</li>
          <li><strong>Energy:</strong> Consider community solar programs or renewable energy credits for your home</li>
        </ul>
      </div>

      {/* Data Note */}
      <div className="flex items-start gap-2 text-xs text-slate-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        <p>
          Sustainability scores are self-reported and meant to encourage improvement.
          Display your score on your storefront to attract eco-conscious customers.
        </p>
      </div>
    </div>
  )
}
