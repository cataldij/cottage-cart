'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Scale,
  Sparkles,
  Loader2,
  AlertTriangle,
  ChefHat,
  DollarSign,
  ArrowRight,
  Copy,
  Check,
  Plus,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScaledIngredient {
  name: string
  original_quantity: number
  original_unit: string
  scaled_quantity: number
  scaled_unit: string
  cost_original: number
  cost_scaled: number
}

interface ScaledRecipe {
  name: string
  original_yield: number
  scaled_yield: number
  yield_unit: string
  scale_factor: number
  ingredients: ScaledIngredient[]
  total_cost_original: number
  total_cost_scaled: number
  cost_per_unit_original: number
  cost_per_unit_scaled: number
  tips: string[]
}

const QUICK_SCALES = [0.5, 1, 1.5, 2, 3, 4, 5]

export default function RecipeScalerPage() {
  const [input, setInput] = useState('')
  const [scaleFactor, setScaleFactor] = useState(2)
  const [customScale, setCustomScale] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScaledRecipe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const effectiveScale = customScale ? Number(customScale) : scaleFactor

  const scaleRecipe = async () => {
    if (!input.trim() || effectiveScale <= 0) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ai/price-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: input.trim(),
          mode: 'scale',
          scaleFactor: effectiveScale,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scaling failed')
      }

      const data = await res.json()

      if (data.recipe && data.recipe.ingredients) {
        // Build the scaled result from the AI response
        const recipe = data.recipe
        const factor = effectiveScale
        const originalYield = recipe.batch_yield || 1

        const scaledIngredients: ScaledIngredient[] = (recipe.ingredients || []).map((ing: any) => ({
          name: ing.name,
          original_quantity: ing.quantity,
          original_unit: ing.unit,
          scaled_quantity: Math.round(ing.quantity * factor * 100) / 100,
          scaled_unit: ing.unit,
          cost_original: ing.cost_in_recipe || 0,
          cost_scaled: Math.round((ing.cost_in_recipe || 0) * factor * 100) / 100,
        }))

        const totalOriginal = scaledIngredients.reduce((s, i) => s + i.cost_original, 0)
        const totalScaled = scaledIngredients.reduce((s, i) => s + i.cost_scaled, 0)

        setResult({
          name: recipe.name,
          original_yield: originalYield,
          scaled_yield: Math.round(originalYield * factor),
          yield_unit: recipe.yield_unit || 'pieces',
          scale_factor: factor,
          ingredients: scaledIngredients,
          total_cost_original: totalOriginal,
          total_cost_scaled: totalScaled,
          cost_per_unit_original: originalYield > 0 ? totalOriginal / originalYield : 0,
          cost_per_unit_scaled: (originalYield * factor) > 0 ? totalScaled / (originalYield * factor) : 0,
          tips: recipe.notes ? [recipe.notes] : [],
        })
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyIngredientList = () => {
    if (!result) return
    const text = result.ingredients
      .map(i => `${i.scaled_quantity} ${i.scaled_unit} ${i.name}`)
      .join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Scale className="h-6 w-6 text-amber-600" />
          Recipe Scaler
        </h1>
        <p className="text-sm text-slate-500">
          Scale any recipe up or down with correct ratios and updated costs
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
              placeholder="Example: I make 24 chocolate chip cookies using 2 cups butter, 3 cups flour, 1.5 cups sugar, 1 cup brown sugar, 2 eggs, 1 bag chocolate chips, 1 tsp vanilla, 1 tsp baking soda, 1 tsp salt"
              className="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Scale Factor */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Scale factor</label>
            <div className="flex flex-wrap items-center gap-2">
              {QUICK_SCALES.map(s => (
                <button
                  key={s}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all',
                    scaleFactor === s && !customScale
                      ? 'bg-amber-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                  onClick={() => { setScaleFactor(s); setCustomScale('') }}
                >
                  {s === 0.5 ? '½x' : `${s}x`}
                </button>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={customScale}
                  onChange={e => setCustomScale(e.target.value)}
                  placeholder="Custom"
                  className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="text-sm text-slate-400">x</span>
              </div>
            </div>
          </div>

          <Button
            onClick={scaleRecipe}
            disabled={loading || !input.trim() || effectiveScale <= 0}
            className="gap-2 rounded-xl bg-amber-700 px-6 text-white hover:bg-amber-800"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scaling...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Scale Recipe
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <Scale className="h-10 w-10 animate-pulse text-amber-500" />
          <p className="text-sm font-medium text-slate-600">Scaling your recipe and calculating costs...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">{result.name}</h2>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs text-slate-500">Original</p>
                <p className="text-lg font-semibold text-slate-600">
                  {result.original_yield} {result.yield_unit}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-slate-500">Scaled ({result.scale_factor}x)</p>
                <p className="text-2xl font-bold text-amber-800">
                  {result.scaled_yield} {result.yield_unit}
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Scaled Ingredients</h3>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={copyIngredientList}
              >
                {copied ? <Check className="mr-1 h-3 w-3 text-green-600" /> : <Copy className="mr-1 h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy List'}
              </Button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Ingredient</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-400">Original</th>
                    <th className="px-4 py-2 text-right font-semibold text-amber-700">Scaled ({result.scale_factor}x)</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ingredients.map((ing, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-800">{ing.name}</td>
                      <td className="px-4 py-2 text-right text-slate-400">
                        {ing.original_quantity} {ing.original_unit}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-amber-800">
                        {ing.scaled_quantity} {ing.scaled_unit}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        ${ing.cost_scaled.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={2} className="px-4 py-2 font-semibold text-slate-700">Total Cost</td>
                    <td className="px-4 py-2 text-right font-bold text-amber-800">
                      ${result.total_cost_scaled.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-slate-400">
                      (was ${result.total_cost_original.toFixed(2)})
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Cost Comparison */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Original Batch Cost</p>
              <p className="mt-2 text-2xl font-bold text-slate-600">${result.total_cost_original.toFixed(2)}</p>
              <p className="mt-1 text-xs text-slate-400">
                ${result.cost_per_unit_original.toFixed(2)} per {result.yield_unit.replace(/s$/, '')}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Scaled Batch Cost ({result.scale_factor}x)</p>
              <p className="mt-2 text-2xl font-bold text-amber-800">${result.total_cost_scaled.toFixed(2)}</p>
              <p className="mt-1 text-xs text-amber-600">
                ${result.cost_per_unit_scaled.toFixed(2)} per {result.yield_unit.replace(/s$/, '')}
              </p>
            </div>
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="font-semibold text-blue-800">Scaling Tips</p>
              {result.tips.map((tip, i) => (
                <p key={i} className="mt-1 text-sm text-blue-700">{tip}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
