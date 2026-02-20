'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Calculator,
  ChefHat,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Package,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  MapPin,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const EXAMPLE_RECIPES = [
  'I make 24 chocolate chip cookies using 2 cups butter, 3 cups flour, 1.5 cups sugar, 1 cup brown sugar, 2 eggs, 1 bag Ghirardelli chocolate chips ($3.49), 1 tsp vanilla, 1 tsp baking soda, 1 tsp salt',
  'Sourdough boule - 3 cups bread flour, 1 cup sourdough starter, 1.5 tsp salt, 1 cup water. Makes 1 loaf.',
  'Habanero mango hot sauce - 10 habanero peppers, 3 mangos, 1 cup white vinegar, 2 tbsp honey, 1 tsp salt, 1 lime. Makes six 5oz bottles.',
  'Seasonal truffle box - 1 lb dark chocolate ($8), 1 cup heavy cream, 2 tbsp butter, cocoa powder for dusting. Makes 24 truffles.',
]

interface Ingredient {
  name: string
  quantity: number
  unit: string
  estimated_package_price: number
  estimated_package_size: number
  estimated_package_unit: string
  cost_in_recipe: number
}

interface Recipe {
  name: string
  description: string
  category: string
  batch_yield: number
  yield_unit: string
  ingredients: Ingredient[]
  packaging_cost_estimate: number
  overhead_cost_estimate: number
  total_ingredient_cost: number
  cost_per_unit: number
  notes: string
}

interface MarketRange {
  low: number
  high: number
}

interface Pricing {
  product_name: string
  cost_per_unit: number
  market_analysis: {
    farmers_market_range: MarketRange
    home_baker_range: MarketRange
    artisan_bakery_range: MarketRange
    online_range: MarketRange
  }
  recommended_price: number
  margin_percent: number
  reasoning: string
  pricing_tips: string[]
  revenue_projection: {
    weekly_units: number
    weekly_revenue: number
    weekly_profit: number
    monthly_profit: number
    annual_revenue: number
  }
  state_info: {
    state: string
    revenue_cap: number | null
    cap_note: string
    months_to_cap: number | null
    labeling_required: string
  }
}

export default function CalculatorPage() {
  const [input, setInput] = useState('')
  const [state, setState] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const analyze = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    setRecipe(null)
    setPricing(null)

    try {
      const res = await fetch('/api/ai/price-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: input.trim(),
          state: state || undefined,
          mode: 'full',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const data = await res.json()
      setRecipe(data.recipe)
      setPricing(data.pricing)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Calculator className="h-6 w-6 text-amber-600" />
          Price Calculator
        </h1>
        <p className="text-sm text-slate-500">
          Describe your recipe and get AI-powered cost analysis, competitive pricing, and smart recommendations.
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Describe your recipe
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tell me what you make and what goes into it. Include quantities and how many it makes. For example: 'I make 2 dozen chocolate chip cookies with 2 cups butter, 3 cups flour...'"
              className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-end gap-3">
            <div className="w-48">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                <MapPin className="mr-1 inline h-3.5 w-3.5" />
                Your state
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">Select state...</option>
                {US_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={analyze}
              disabled={loading || !input.trim()}
              className="gap-2 rounded-xl bg-amber-700 px-6 text-white hover:bg-amber-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze & Price
                </>
              )}
            </Button>
          </div>

          {/* Example recipes */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-400">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_RECIPES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInput(ex)}
                  className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                >
                  {ex.split(' - ')[0].split(' using ')[0].split(' makes ')[0].substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Sparkles className="h-6 w-6 animate-pulse text-amber-600" />
          </div>
          <p className="text-sm font-medium text-slate-600">Analyzing your recipe and researching market prices...</p>
          <p className="text-xs text-slate-400">This usually takes 5-10 seconds</p>
        </div>
      )}

      {/* Results */}
      {recipe && !loading && (
        <div className="space-y-4">
          {/* Cost Breakdown Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <ChefHat className="h-5 w-5 text-amber-600" />
              {recipe.name}
            </h2>
            {recipe.description && (
              <p className="mb-4 text-sm text-slate-500">{recipe.description}</p>
            )}

            <div className="mb-4 flex items-center gap-4 text-sm">
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                {recipe.category}
              </span>
              <span className="text-slate-500">
                Makes <strong>{recipe.batch_yield} {recipe.yield_unit}</strong>
              </span>
            </div>

            {/* Ingredients table */}
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Ingredient</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Amount Used</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Package Price</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Cost in Recipe</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.ingredients.map((ing, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-800">{ing.name}</td>
                      <td className="px-4 py-2 text-slate-600">{ing.quantity} {ing.unit}</td>
                      <td className="px-4 py-2 text-slate-500">
                        ${ing.estimated_package_price?.toFixed(2)} / {ing.estimated_package_size} {ing.estimated_package_unit}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-800">
                        ${ing.cost_in_recipe?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-4 py-2 font-semibold text-slate-700">Ingredients Total</td>
                    <td className="px-4 py-2 text-right font-bold text-slate-900">${recipe.total_ingredient_cost?.toFixed(2)}</td>
                  </tr>
                  {recipe.packaging_cost_estimate > 0 && (
                    <tr className="border-t border-slate-100 bg-slate-50">
                      <td colSpan={3} className="px-4 py-2 text-slate-600">+ Packaging estimate</td>
                      <td className="px-4 py-2 text-right text-slate-700">${recipe.packaging_cost_estimate?.toFixed(2)}</td>
                    </tr>
                  )}
                  {recipe.overhead_cost_estimate > 0 && (
                    <tr className="border-t border-slate-100 bg-slate-50">
                      <td colSpan={3} className="px-4 py-2 text-slate-600">+ Overhead (utilities, gas)</td>
                      <td className="px-4 py-2 text-right text-slate-700">${recipe.overhead_cost_estimate?.toFixed(2)}</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Cost per unit highlight */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Cost per {recipe.yield_unit?.replace(/s$/, '')}</p>
                <p className="text-3xl font-bold text-amber-800">${recipe.cost_per_unit?.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Batch Cost</p>
                <p className="text-xl font-bold text-amber-700">
                  ${((recipe.total_ingredient_cost || 0) + (recipe.packaging_cost_estimate || 0) + (recipe.overhead_cost_estimate || 0)).toFixed(2)}
                </p>
              </div>
            </div>

            {recipe.notes && (
              <p className="mt-3 text-xs italic text-slate-400">{recipe.notes}</p>
            )}
          </div>

          {/* Pricing Analysis Card */}
          {pricing && (
            <>
              {/* Recommended Price */}
              <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Recommended Price
                </h2>

                <div className="flex flex-wrap items-start gap-8">
                  <div>
                    <p className="text-sm text-slate-500">Sell each for</p>
                    <p className="text-5xl font-bold text-green-700">${pricing.recommended_price?.toFixed(2)}</p>
                    <p className="mt-1 text-sm text-green-600">{pricing.margin_percent?.toFixed(0)}% margin</p>
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-slate-700">{pricing.reasoning}</p>
                    {pricing.pricing_tips?.length > 0 && (
                      <div className="space-y-1">
                        {pricing.pricing_tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Market Comparison + Revenue Projection */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Market Comparison */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Market Comparison
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Farmer's Markets", range: pricing.market_analysis?.farmers_market_range },
                      { label: 'Home Bakers', range: pricing.market_analysis?.home_baker_range },
                      { label: 'Artisan Bakeries', range: pricing.market_analysis?.artisan_bakery_range },
                      { label: 'Online', range: pricing.market_analysis?.online_range },
                    ].map((channel) => {
                      if (!channel.range) return null
                      const range = channel.range
                      const recommended = pricing.recommended_price || 0
                      const max = Math.max(range.high, recommended) * 1.1
                      const leftPct = (range.low / max) * 100
                      const widthPct = ((range.high - range.low) / max) * 100
                      const recPct = (recommended / max) * 100

                      return (
                        <div key={channel.label}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-slate-600">{channel.label}</span>
                            <span className="font-medium text-slate-800">
                              ${range.low?.toFixed(2)} - ${range.high?.toFixed(2)}
                            </span>
                          </div>
                          <div className="relative h-4 rounded-full bg-slate-100">
                            <div
                              className="absolute h-full rounded-full bg-blue-200"
                              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            />
                            <div
                              className="absolute top-0 h-full w-0.5 bg-green-600"
                              style={{ left: `${recPct}%` }}
                              title={`Your price: $${recommended.toFixed(2)}`}
                            />
                          </div>
                        </div>
                      )
                    })}
                    <p className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-600" /> Your recommended price
                    </p>
                  </div>
                </div>

                {/* Revenue Projection */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Revenue Projection
                  </h3>
                  {pricing.revenue_projection && (
                    <div className="space-y-3">
                      {[
                        { label: 'Weekly volume', value: `${pricing.revenue_projection.weekly_units} ${recipe.yield_unit}` },
                        { label: 'Weekly revenue', value: `$${pricing.revenue_projection.weekly_revenue?.toFixed(2)}`, highlight: false },
                        { label: 'Weekly profit', value: `$${pricing.revenue_projection.weekly_profit?.toFixed(2)}`, highlight: false },
                        { label: 'Monthly profit', value: `$${pricing.revenue_projection.monthly_profit?.toFixed(2)}`, highlight: true },
                        { label: 'Annual revenue', value: `$${pricing.revenue_projection.annual_revenue?.toLocaleString()}`, highlight: true },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{row.label}</span>
                          <span className={cn(
                            'text-sm font-semibold',
                            row.highlight ? 'text-green-700' : 'text-slate-800'
                          )}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* State compliance info */}
                  {pricing.state_info && (
                    <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3">
                      <p className="mb-1 text-xs font-semibold text-amber-700">
                        <MapPin className="mr-1 inline h-3 w-3" />
                        {pricing.state_info.state} Cottage Food Info
                      </p>
                      <p className="text-xs text-amber-600">{pricing.state_info.cap_note}</p>
                      {pricing.state_info.months_to_cap && (
                        <p className="mt-1 text-xs text-amber-600">
                          At this pace, you&apos;d reach the cap in ~{pricing.state_info.months_to_cap} months
                        </p>
                      )}
                      {pricing.state_info.labeling_required && (
                        <p className="mt-1 text-xs text-slate-500">
                          Labeling: {pricing.state_info.labeling_required}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Shop CTA */}
              <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-5">
                <div>
                  <p className="font-semibold text-green-800">Ready to list this in your shop?</p>
                  <p className="text-sm text-green-600">
                    Add {recipe.name} at ${pricing.recommended_price?.toFixed(2)} to your storefront
                  </p>
                </div>
                <Button
                  className="gap-2 rounded-xl bg-green-700 text-white hover:bg-green-800"
                  onClick={() => {
                    const params = new URLSearchParams({
                      name: recipe.name,
                      price: pricing.recommended_price?.toFixed(2) || '',
                      description: recipe.description || '',
                    })
                    router.push(`/products?${params.toString()}`)
                  }}
                >
                  <Package className="h-4 w-4" />
                  Add to My Shop
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
