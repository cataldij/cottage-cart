// @ts-nocheck
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  ChevronDown,
  TrendingUp,
  DollarSign,
  FileText,
  Award,
  Umbrella,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StateRule {
  id: string
  state_code: string
  state_name: string
  revenue_cap: number | null
  revenue_cap_notes: string | null
  cap_tiers: Array<{ name: string; limit: number; requirements: string }> | null
  requires_registration: boolean
  registration_fee: number
  registration_url: string | null
  registration_notes: string | null
  requires_food_handler_cert: boolean
  cert_validity_years: number
  requires_insurance: boolean
  allows_tcs_foods: boolean
  uses_prohibited_list: boolean
  allowed_foods_list: Array<{ category: string; items: string[] }> | null
  prohibited_foods_list: Array<{ category: string; items: string[] }> | null
  home_kitchen_disclaimer: string | null
  labeling_requirements: Array<{ field: string; required: boolean; notes?: string }> | null
  additional_notes: string | null
  direct_to_consumer_only: boolean
  online_sales_allowed: boolean
  internet_sales_allowed: boolean
  farmers_market_allowed: boolean
  wholesale_allowed: boolean
  source_urls: Array<{ label: string; url: string }> | null
}

interface ShopCompliance {
  id: string
  shop_id: string
  state_code: string
  registration_status: string
  registration_number: string | null
  registration_expiry: string | null
  food_handler_status: string
  food_handler_cert_number: string | null
  food_handler_expiry: string | null
  food_handler_provider: string | null
  insurance_status: string
  insurance_provider: string | null
  insurance_expiry: string | null
  insurance_coverage_amount: number | null
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'text-slate-500', bg: 'bg-slate-100', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  active: { label: 'Active', color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle2 },
  expired: { label: 'Expired', color: 'text-red-700', bg: 'bg-red-50', icon: ShieldX },
  not_required: { label: 'Not Required', color: 'text-slate-400', bg: 'bg-slate-50', icon: CheckCircle2 },
  none: { label: 'None', color: 'text-slate-500', bg: 'bg-slate-100', icon: Circle },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', config.bg, config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return null
  const days = daysUntil(date)
  if (days === null) return null
  const color = days < 0 ? 'text-red-600' : days < 30 ? 'text-amber-600' : 'text-slate-500'
  const label = days < 0 ? `Expired ${Math.abs(days)}d ago` : `Expires in ${days}d`
  return <span className={cn('text-xs', color)}>{label}</span>
}

// ── Revenue section ────────────────────────────────────────────────────────────

function RevenueCapCard({ cap, ytd, state }: { cap: number | null; ytd: number; state: string }) {
  if (cap === null) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue Cap</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">${ytd.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Year-to-date</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <span className="font-medium">{state} has no annual revenue cap.</span> Keep selling!
        </div>
      </div>
    )
  }

  const pct = Math.min((ytd / cap) * 100, 100)
  const remaining = Math.max(cap - ytd, 0)
  const barColor = pct < 80 ? 'bg-green-500' : pct < 95 ? 'bg-amber-500' : 'bg-red-500'
  const statusColor = pct < 80 ? 'text-green-700 bg-green-50' : pct < 95 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue Cap</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">${ytd.toLocaleString()}</p>
          <p className="text-xs text-slate-500">of ${cap.toLocaleString()} annual cap</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{pct.toFixed(1)}% used</span>
          <span>${remaining.toLocaleString()} remaining</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div className={cn('h-2 rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {pct >= 80 && (
        <div className={cn('mt-3 rounded-lg px-3 py-2 text-xs font-medium', statusColor)}>
          {pct >= 100
            ? 'You have reached your annual revenue cap. Consult a lawyer before accepting more orders.'
            : pct >= 95
            ? 'Approaching cap — only $' + remaining.toLocaleString() + ' remaining this year.'
            : '80% of cap reached — plan ahead for the rest of the year.'}
        </div>
      )}
    </div>
  )
}

// ── Compliance card ─────────────────────────────────────────────────────────────

function ComplianceCard({
  title,
  icon: Icon,
  iconBg,
  status,
  detail,
  expiry,
  required,
  onUpdate,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  status: string
  detail?: string | null
  expiry?: string | null
  required: boolean
  onUpdate: () => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-white', iconBg)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{title}</p>
            {!required && <p className="text-xs text-slate-400">Not required in your state</p>}
          </div>
        </div>
        <StatusBadge status={required ? status : 'not_required'} />
      </div>
      {required && (
        <div className="mt-3 space-y-1 pl-13">
          {detail && <p className="text-xs text-slate-500">{detail}</p>}
          <ExpiryBadge date={expiry} />
        </div>
      )}
      <button
        onClick={onUpdate}
        className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Update Status
      </button>
    </div>
  )
}

// ── State selector ─────────────────────────────────────────────────────────────

const SUPPORTED_STATES = [
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'CA', name: 'California' },
  { code: 'UT', name: 'Utah' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'CO', name: 'Colorado' },
  { code: 'MI', name: 'Michigan' },
  { code: 'OH', name: 'Ohio' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'VA', name: 'Virginia' },
]

// ── Update modal ──────────────────────────────────────────────────────────────

function UpdateModal({
  type,
  current,
  onSave,
  onClose,
}: {
  type: string
  current: ShopCompliance
  onSave: (updates: Partial<ShopCompliance>) => Promise<void>
  onClose: () => void
}) {
  const [status, setStatus] = useState<string>(
    type === 'registration' ? current.registration_status
    : type === 'food_handler' ? current.food_handler_status
    : current.insurance_status
  )
  const [number, setNumber] = useState<string>(
    type === 'registration' ? (current.registration_number || '')
    : type === 'food_handler' ? (current.food_handler_cert_number || '')
    : (current.insurance_policy_number || '')
  )
  const [expiry, setExpiry] = useState<string>(
    type === 'registration' ? (current.registration_expiry || '')
    : type === 'food_handler' ? (current.food_handler_expiry || '')
    : (current.insurance_expiry || '')
  )
  const [saving, setSaving] = useState(false)

  const statusOptions =
    type === 'insurance'
      ? ['none', 'active', 'expired', 'not_required']
      : ['not_started', 'in_progress', 'active', 'expired', 'not_required']

  const label =
    type === 'registration' ? 'Registration / Permit'
    : type === 'food_handler' ? 'Food Handler Certificate'
    : 'Insurance'

  const handleSave = async () => {
    setSaving(true)
    const updates: Partial<ShopCompliance> = {}
    if (type === 'registration') {
      updates.registration_status = status
      updates.registration_number = number || null
      updates.registration_expiry = expiry || null
    } else if (type === 'food_handler') {
      updates.food_handler_status = status
      updates.food_handler_cert_number = number || null
      updates.food_handler_expiry = expiry || null
    } else {
      updates.insurance_status = status
      updates.insurance_policy_number = number || null
      updates.insurance_expiry = expiry || null
    }
    await onSave(updates)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900">Update {label}</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
              ))}
            </select>
          </div>
          {status !== 'not_started' && status !== 'not_required' && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600">
                  {type === 'registration' ? 'Registration Number' : type === 'food_handler' ? 'Certificate Number' : 'Policy Number'}
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Expiry Date</label>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-amber-700 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const supabase: any = createClient()

  const [shop, setShop] = useState<any>(null)
  const [compliance, setCompliance] = useState<ShopCompliance | null>(null)
  const [stateRule, setStateRule] = useState<StateRule | null>(null)
  const [ytdRevenue, setYtdRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState('')
  const [savingState, setSavingState] = useState(false)
  const [modal, setModal] = useState<string | null>(null) // 'registration' | 'food_handler' | 'insurance'
  const [showStateInfo, setShowStateInfo] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    // Get shop
    const { data: shopData } = await supabase
      .from('shops')
      .select('*')
      .eq('created_by', session.user.id)
      .single()

    if (!shopData) { setLoading(false); return }
    setShop(shopData)

    // Get compliance record
    const { data: compData } = await supabase
      .from('shop_compliance')
      .select('*')
      .eq('shop_id', shopData.id)
      .single()

    setCompliance(compData || null)

    // Load state rule if we have a state
    if (compData?.state_code) {
      const { data: rule } = await supabase
        .from('state_compliance_rules')
        .select('*')
        .eq('state_code', compData.state_code)
        .single()
      setStateRule(rule || null)
    }

    // Calculate YTD revenue from orders (current calendar year)
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString()
    const { data: orders } = await supabase
      .from('shop_orders')
      .select('total, status')
      .eq('shop_id', shopData.id)
      .gte('created_at', yearStart)

    const ytd = (orders || [])
      .filter((o: any) => o.status !== 'cancelled')
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0)
    setYtdRevenue(ytd)

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSetState = async () => {
    if (!shop || !selectedState) return
    setSavingState(true)

    // Upsert compliance record
    const { data: existing } = await supabase
      .from('shop_compliance')
      .select('id')
      .eq('shop_id', shop.id)
      .single()

    if (existing) {
      await supabase
        .from('shop_compliance')
        .update({ state_code: selectedState })
        .eq('shop_id', shop.id)
    } else {
      await supabase
        .from('shop_compliance')
        .insert({ shop_id: shop.id, state_code: selectedState })
    }

    // Load the new state rule
    const { data: rule } = await supabase
      .from('state_compliance_rules')
      .select('*')
      .eq('state_code', selectedState)
      .single()
    setStateRule(rule || null)

    await load()
    setSavingState(false)
  }

  const handleUpdateCompliance = async (updates: Partial<ShopCompliance>) => {
    if (!compliance) return
    await supabase
      .from('shop_compliance')
      .update(updates)
      .eq('id', compliance.id)
    await load()
  }

  // ── Loading ──

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
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p className="text-slate-600">Create your shop first to manage compliance.</p>
      </div>
    )
  }

  // ── No state set ──

  if (!compliance?.state_code) {
    return (
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur-xl">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.2),_transparent_70%)] blur-3xl" />
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-soft">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Compliance Center</h1>
            <p className="mt-2 text-slate-500">
              Stay legal and grow confidently. Select your state to get personalized compliance requirements.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Which state do you sell in?</h2>
          <p className="mt-1 text-sm text-slate-500">
            We'll show you the exact requirements for your state — permits, certifications, revenue caps, and label rules.
          </p>
          <div className="mt-4 flex gap-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select your state…</option>
              {SUPPORTED_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            <Button
              onClick={handleSetState}
              disabled={!selectedState || savingState}
              className="rounded-xl bg-amber-700 px-6 text-white hover:bg-amber-800"
            >
              {savingState ? 'Saving…' : 'Set State'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            More states coming soon. Don't see yours? We're adding all 50.
          </p>
        </section>
      </div>
    )
  }

  // ── Main compliance view ──

  const reg = compliance.registration_status
  const fh = compliance.food_handler_status
  const ins = compliance.insurance_status

  // Score: how many required items are "active"
  const requiredItems = [
    stateRule?.requires_registration && reg,
    stateRule?.requires_food_handler_cert && fh,
    stateRule?.requires_insurance && ins,
  ].filter(Boolean)
  const activeItems = [
    stateRule?.requires_registration && reg === 'active',
    stateRule?.requires_food_handler_cert && fh === 'active',
    stateRule?.requires_insurance && ins === 'active',
  ].filter(Boolean)
  const score = requiredItems.length === 0 ? 100 : Math.round((activeItems.length / requiredItems.length) * 100)

  const hasAlerts = [
    daysUntil(compliance.registration_expiry) !== null && daysUntil(compliance.registration_expiry)! < 30,
    daysUntil(compliance.food_handler_expiry) !== null && daysUntil(compliance.food_handler_expiry)! < 30,
    daysUntil(compliance.insurance_expiry) !== null && daysUntil(compliance.insurance_expiry)! < 30,
    stateRule?.revenue_cap && ytdRevenue / stateRule.revenue_cap >= 0.8,
  ].some(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.2),_transparent_70%)] blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft',
              score === 100 ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : score >= 60 ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
            )}>
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Compliance Center</h1>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {stateRule?.state_name}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {score === 100 ? 'All required items are up to date.' : `${100 - score}% of required compliance items need attention.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedState('')}
            className="text-xs text-amber-700 hover:text-amber-800 hover:underline"
          >
            Change state
          </button>
        </div>
      </section>

      {/* Alert banner */}
      {hasAlerts && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Action required</p>
            <p className="text-xs text-amber-700">
              One or more compliance items need your attention. Review the cards below.
            </p>
          </div>
        </div>
      )}

      {/* Revenue cap */}
      <RevenueCapCard
        cap={stateRule?.revenue_cap ?? null}
        ytd={ytdRevenue}
        state={stateRule?.state_name || ''}
      />

      {/* Compliance cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ComplianceCard
          title="Registration / Permit"
          icon={FileText}
          iconBg="bg-blue-600"
          status={reg}
          required={stateRule?.requires_registration ?? false}
          detail={compliance.registration_number ? `Permit #${compliance.registration_number}` : stateRule?.registration_fee ? `Fee: $${stateRule.registration_fee}` : null}
          expiry={compliance.registration_expiry}
          onUpdate={() => setModal('registration')}
        />
        <ComplianceCard
          title="Food Handler Cert"
          icon={Award}
          iconBg="bg-purple-600"
          status={fh}
          required={stateRule?.requires_food_handler_cert ?? false}
          detail={compliance.food_handler_cert_number ? `Cert #${compliance.food_handler_cert_number}` : compliance.food_handler_provider || null}
          expiry={compliance.food_handler_expiry}
          onUpdate={() => setModal('food_handler')}
        />
        <ComplianceCard
          title="Business Insurance"
          icon={Umbrella}
          iconBg="bg-teal-600"
          status={ins}
          required={stateRule?.requires_insurance ?? false}
          detail={compliance.insurance_provider || (compliance.insurance_coverage_amount ? `$${compliance.insurance_coverage_amount.toLocaleString()} coverage` : null)}
          expiry={compliance.insurance_expiry}
          onUpdate={() => setModal('insurance')}
        />
      </section>

      {/* State info accordion */}
      <section className="rounded-3xl border border-slate-200 bg-white">
        <button
          onClick={() => setShowStateInfo(!showStateInfo)}
          className="flex w-full items-center justify-between p-6"
        >
          <div>
            <h2 className="text-left font-bold text-slate-900">{stateRule?.state_name} — Cottage Food Rules</h2>
            <p className="text-left text-xs text-slate-500">Key requirements, allowed foods, and label rules</p>
          </div>
          <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform', showStateInfo && 'rotate-180')} />
        </button>
        {showStateInfo && stateRule && (
          <div className="border-t border-slate-100 px-6 pb-6 space-y-5">
            {/* Notes */}
            {stateRule.additional_notes && (
              <p className="text-sm text-slate-600 leading-relaxed">{stateRule.additional_notes}</p>
            )}

            {/* Revenue cap */}
            {stateRule.revenue_cap_notes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Revenue Cap</p>
                <p className="text-sm text-slate-600">{stateRule.revenue_cap_notes}</p>
              </div>
            )}

            {/* Sales channels */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Allowed Sales Channels</p>
              <div className="flex flex-wrap gap-2">
                {stateRule.farmers_market_allowed && <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">Farmers Markets</span>}
                {!stateRule.direct_to_consumer_only && stateRule.wholesale_allowed && <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">Wholesale</span>}
                {stateRule.internet_sales_allowed && <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">Internet Sales</span>}
                {stateRule.direct_to_consumer_only && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">Direct to Consumer Only</span>}
                {!stateRule.wholesale_allowed && <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">No Wholesale</span>}
              </div>
            </div>

            {/* Allowed foods */}
            {stateRule.allowed_foods_list && stateRule.allowed_foods_list.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Allowed Foods</p>
                {stateRule.allowed_foods_list.map((cat: any) => (
                  <div key={cat.category} className="mb-2">
                    <p className="text-xs font-medium text-slate-600 mb-1">{cat.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.items.map((item: string) => (
                        <span key={item} className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Prohibited foods */}
            {stateRule.prohibited_foods_list && stateRule.prohibited_foods_list.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Prohibited Foods</p>
                {stateRule.prohibited_foods_list.map((cat: any) => (
                  <div key={cat.category} className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {cat.items.map((item: string) => (
                        <span key={item} className="rounded-lg bg-red-50 px-2 py-0.5 text-xs text-red-600">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Label disclaimer */}
            {stateRule.home_kitchen_disclaimer && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Required Label Disclaimer</p>
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm italic text-amber-800">
                  "{stateRule.home_kitchen_disclaimer}"
                </p>
              </div>
            )}

            {/* Sources */}
            {stateRule.source_urls && stateRule.source_urls.length > 0 && (
              <div className="flex gap-2">
                {stateRule.source_urls.map((src: any) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {src.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Update modal */}
      {modal && compliance && (
        <UpdateModal
          type={modal}
          current={compliance}
          onSave={handleUpdateCompliance}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
