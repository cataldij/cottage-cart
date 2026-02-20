// @ts-nocheck
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tag, Printer, Download, RefreshCw, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  description: string | null
  allergens: string[] | null
}

interface Shop {
  id: string
  name: string
  location_address: string | null
  location_name: string | null
}

interface StateRule {
  state_code: string
  state_name: string
  home_kitchen_disclaimer: string | null
  labeling_requirements: Array<{ field: string; required: boolean; notes?: string }> | null
}

interface LabelData {
  productName: string
  producerName: string
  producerAddress: string
  ingredients: string
  netWeight: string
  allergens: string
  disclaimer: string
  date: string
  lotNumber: string
}

// ── Label preview ─────────────────────────────────────────────────────────────

function LabelPreview({ data, stateName }: { data: LabelData; stateName: string }) {
  return (
    <div
      id="label-preview"
      className="mx-auto w-full max-w-[400px] rounded-2xl border-2 border-slate-800 bg-white p-6 font-mono text-sm shadow-lg"
      style={{ minHeight: 300 }}
    >
      {/* Product name */}
      <div className="border-b-2 border-slate-800 pb-3 mb-3 text-center">
        <p className="text-xl font-bold text-slate-900 uppercase tracking-wide">
          {data.productName || 'Product Name'}
        </p>
        {data.netWeight && (
          <p className="text-xs text-slate-500 mt-0.5">Net Wt: {data.netWeight}</p>
        )}
      </div>

      {/* Ingredients */}
      {data.ingredients && (
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ingredients</p>
          <p className="text-xs text-slate-800 leading-relaxed mt-0.5">{data.ingredients}</p>
        </div>
      )}

      {/* Allergens */}
      {data.allergens && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 px-2 py-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Contains</p>
          <p className="text-xs font-semibold text-red-800 mt-0.5">{data.allergens}</p>
        </div>
      )}

      {/* Producer info */}
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Produced By</p>
        <p className="text-xs text-slate-800 mt-0.5">{data.producerName || 'Your Business Name'}</p>
        {data.producerAddress && (
          <p className="text-xs text-slate-600">{data.producerAddress}</p>
        )}
      </div>

      {/* Date / lot */}
      <div className="mb-3 flex gap-6">
        {data.date && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</p>
            <p className="text-xs text-slate-800 mt-0.5">{data.date}</p>
          </div>
        )}
        {data.lotNumber && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lot #</p>
            <p className="text-xs text-slate-800 mt-0.5">{data.lotNumber}</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      {data.disclaimer && (
        <div className="border-t border-slate-200 pt-3 mt-3">
          <p className="text-[10px] italic text-slate-500 leading-relaxed">{data.disclaimer}</p>
        </div>
      )}

      {/* State label */}
      <div className="mt-3 text-right">
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
          {stateName} Cottage Food
        </span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LabelsPage() {
  const supabase: any = createClient()
  const labelRef = useRef<HTMLDivElement>(null)

  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [stateRule, setStateRule] = useState<StateRule | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState('')

  const [label, setLabel] = useState<LabelData>({
    productName: '',
    producerName: '',
    producerAddress: '',
    ingredients: '',
    netWeight: '',
    allergens: '',
    disclaimer: '',
    date: new Date().toLocaleDateString('en-US'),
    lotNumber: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const { data: shopData } = await supabase
      .from('shops')
      .select('id, name, location_address, location_name')
      .eq('created_by', session.user.id)
      .single()

    if (!shopData) { setLoading(false); return }
    setShop(shopData)

    // Pre-fill producer info from shop
    setLabel(prev => ({
      ...prev,
      producerName: shopData.name,
      producerAddress: shopData.location_address || shopData.location_name || '',
    }))

    // Load products
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, description, allergens')
      .eq('shop_id', shopData.id)
      .eq('is_available', true)
      .order('name')

    setProducts(productsData || [])

    // Load state rule for disclaimer
    const { data: compData } = await supabase
      .from('shop_compliance')
      .select('state_code')
      .eq('shop_id', shopData.id)
      .single()

    if (compData?.state_code) {
      const { data: rule } = await supabase
        .from('state_compliance_rules')
        .select('state_code, state_name, home_kitchen_disclaimer, labeling_requirements')
        .eq('state_code', compData.state_code)
        .single()

      if (rule) {
        setStateRule(rule)
        setLabel(prev => ({
          ...prev,
          disclaimer: rule.home_kitchen_disclaimer || '',
        }))
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-fill from selected product
  useEffect(() => {
    if (!selectedProductId) return
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return
    setLabel(prev => ({
      ...prev,
      productName: product.name,
      allergens: (product.allergens || []).join(', '),
    }))
  }, [selectedProductId, products])

  const handlePrint = () => {
    const printContent = document.getElementById('label-preview')
    if (!printContent) return
    const printWindow = window.open('', '', 'width=600,height=400')
    if (!printWindow) return
    printWindow.document.write('<html><head><title>Product Label</title>')
    printWindow.document.write('<style>body{font-family:monospace;padding:24px} @media print{body{margin:0}}</style>')
    printWindow.document.write('</head><body>')
    printWindow.document.write(printContent.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  const updateLabel = (field: keyof LabelData, value: string) => {
    setLabel(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <Tag className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p className="text-slate-600">Create your shop first to generate product labels.</p>
      </div>
    )
  }

  const requiredFields = stateRule?.labeling_requirements?.filter(r => r.required) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.2),_transparent_70%)] blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-soft">
              <Tag className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Label Generator</h1>
              <p className="text-sm text-slate-500">
                {stateRule
                  ? `${stateRule.state_name} compliant labels — includes required disclaimer`
                  : 'Create compliant product labels for your cottage food items'}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-amber-800"
          >
            <Printer className="h-4 w-4" />
            Print Label
          </button>
        </div>
      </section>

      {/* State disclaimer notice */}
      {!stateRule && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Tip:</span> Set your state in{' '}
          <a href="/compliance" className="underline">Compliance Center</a>{' '}
          to auto-fill your state's required disclaimer.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Form */}
        <div className="space-y-4">
          {/* Product selector */}
          {products.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Start from a product</h2>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select a product to auto-fill…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Label fields */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold text-slate-900">Label Fields</h2>

            <Field label="Product Name *" required>
              <input
                type="text"
                value={label.productName}
                onChange={(e) => updateLabel('productName', e.target.value)}
                placeholder="e.g. Sourdough Banana Bread"
                className={inputClass}
              />
            </Field>

            <Field label="Net Weight / Quantity *" required>
              <input
                type="text"
                value={label.netWeight}
                onChange={(e) => updateLabel('netWeight', e.target.value)}
                placeholder="e.g. 12 oz (340g)"
                className={inputClass}
              />
            </Field>

            <Field label="Ingredients *" required hint="List in descending order by weight">
              <textarea
                value={label.ingredients}
                onChange={(e) => updateLabel('ingredients', e.target.value)}
                placeholder="e.g. Bananas, flour, sugar, eggs, butter, baking soda, salt, cinnamon"
                rows={3}
                className={cn(inputClass, 'resize-none')}
              />
            </Field>

            <Field label="Allergens" hint="e.g. Wheat, Eggs, Milk, Tree Nuts">
              <input
                type="text"
                value={label.allergens}
                onChange={(e) => updateLabel('allergens', e.target.value)}
                placeholder="e.g. Wheat, Eggs, Milk"
                className={inputClass}
              />
            </Field>

            <Field label="Producer Name *" required>
              <input
                type="text"
                value={label.producerName}
                onChange={(e) => updateLabel('producerName', e.target.value)}
                placeholder="Your shop or business name"
                className={inputClass}
              />
            </Field>

            <Field label="Producer Address *" required>
              <input
                type="text"
                value={label.producerAddress}
                onChange={(e) => updateLabel('producerAddress', e.target.value)}
                placeholder="City, State (full address optional)"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Pack Date">
                <input
                  type="text"
                  value={label.date}
                  onChange={(e) => updateLabel('date', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Lot # (optional)">
                <input
                  type="text"
                  value={label.lotNumber}
                  onChange={(e) => updateLabel('lotNumber', e.target.value)}
                  placeholder="e.g. 001"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label={stateRule ? `Home Kitchen Disclaimer (${stateRule.state_name} required)` : 'Home Kitchen Disclaimer'}
              required={!!stateRule}
              hint="Auto-filled from your state rules"
            >
              <textarea
                value={label.disclaimer}
                onChange={(e) => updateLabel('disclaimer', e.target.value)}
                placeholder="This food is made in a home kitchen…"
                rows={3}
                className={cn(inputClass, 'resize-none')}
              />
            </Field>
          </div>

          {/* Required fields checklist */}
          {requiredFields.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900 mb-3">
                {stateRule?.state_name} Required Label Fields
              </h2>
              <div className="space-y-2">
                {requiredFields.map((req) => {
                  const filled = getFieldFilled(req.field, label)
                  return (
                    <div key={req.field} className="flex items-center gap-2 text-sm">
                      <div className={cn(
                        'h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0',
                        filled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                      )}>
                        {filled ? '✓' : '○'}
                      </div>
                      <span className={filled ? 'text-slate-700' : 'text-slate-400'}>{req.field}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Label Preview</h2>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
            </div>
            <LabelPreview data={label} stateName={stateRule?.state_name || ''} />
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-semibold text-amber-800 mb-2">Label Tips</p>
            <ul className="space-y-1 text-xs text-amber-700 list-disc list-inside">
              <li>Print on white label stock or cardstock</li>
              <li>Recommended minimum font size: 6pt</li>
              <li>Keep labels clean and waterproof if possible</li>
              <li>Always include your state's required disclaimer</li>
              {stateRule?.state_code === 'CA' && (
                <li>California requires the pack date on all labels</li>
              )}
              {stateRule?.state_code === 'TX' && (
                <li>Texas requires a disclaimer on every product label</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400'

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        {required && <span className="text-red-500 text-xs">*</span>}
      </div>
      {hint && <p className="text-[11px] text-slate-400 mb-1">{hint}</p>}
      {children}
    </div>
  )
}

function getFieldFilled(fieldName: string, label: LabelData): boolean {
  const lower = fieldName.toLowerCase()
  if (lower.includes('product name')) return !!label.productName
  if (lower.includes('ingredient')) return !!label.ingredients
  if (lower.includes('weight') || lower.includes('volume') || lower.includes('quantity')) return !!label.netWeight
  if (lower.includes('allergen')) return !!label.allergens
  if (lower.includes('address') || lower.includes('producer name')) return !!label.producerName && !!label.producerAddress
  if (lower.includes('disclaimer') || lower.includes('home kitchen') || lower.includes('home-produced') || lower.includes('non-inspected')) return !!label.disclaimer
  if (lower.includes('date')) return !!label.date
  return false
}
