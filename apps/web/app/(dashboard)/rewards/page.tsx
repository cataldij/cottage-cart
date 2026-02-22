'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Gift,
  Star,
  Users,
  Trophy,
  Loader2,
  Plus,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface LoyaltyProgram {
  id: string
  name: string
  type: string
  points_per_dollar: number
  reward_threshold: number
  reward_description: string
  is_active: boolean
}

interface CustomerPoints {
  customer_email: string
  customer_name: string
  points: number
  lifetime_points: number
  rewards_redeemed: number
}

export default function RewardsPage() {
  const [shopId, setShopId] = useState<string | null>(null)
  const [program, setProgram] = useState<LoyaltyProgram | null>(null)
  const [members, setMembers] = useState<CustomerPoints[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  // Form state
  const [formName, setFormName] = useState('Rewards')
  const [formType, setFormType] = useState('points')
  const [formPointsPerDollar, setFormPointsPerDollar] = useState(1)
  const [formThreshold, setFormThreshold] = useState(100)
  const [formReward, setFormReward] = useState('10% off your next order')

  const supabase: any = createClient()

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

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

    // Load loyalty program
    const { data: prog } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('shop_id', shop.id)
      .maybeSingle()

    if (prog) {
      setProgram(prog)
      setFormName(prog.name)
      setFormType(prog.type)
      setFormPointsPerDollar(prog.points_per_dollar)
      setFormThreshold(prog.reward_threshold)
      setFormReward(prog.reward_description)

      // Load members
      const { data: loyaltyData } = await supabase
        .from('customer_loyalty')
        .select('customer_email, points, lifetime_points, rewards_redeemed')
        .eq('shop_id', shop.id)
        .eq('program_id', prog.id)
        .order('lifetime_points', { ascending: false })

      // Enrich with names from orders
      const { data: orders } = await supabase
        .from('shop_orders')
        .select('customer_email, customer_name')
        .eq('shop_id', shop.id)

      const nameMap = new Map<string, string>()
      for (const o of orders || []) {
        if (o.customer_email && o.customer_name) {
          nameMap.set(o.customer_email.toLowerCase(), o.customer_name)
        }
      }

      setMembers((loyaltyData || []).map((m: any) => ({
        ...m,
        customer_name: nameMap.get(m.customer_email?.toLowerCase()) || 'Customer',
      })))
    } else {
      setShowSetup(true)
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const saveProgram = async () => {
    if (!shopId) return
    setSaving(true)

    const payload = {
      shop_id: shopId,
      name: formName,
      type: formType,
      points_per_dollar: formPointsPerDollar,
      reward_threshold: formThreshold,
      reward_description: formReward,
      is_active: true,
    }

    if (program) {
      await supabase
        .from('loyalty_programs')
        .update(payload)
        .eq('id', program.id)
    } else {
      await supabase
        .from('loyalty_programs')
        .insert(payload)
    }

    setSaving(false)
    setShowSetup(false)
    loadData()
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
        <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
        <p className="text-muted-foreground">Create your shop first to set up a loyalty program.</p>
        <Button asChild><Link href="/builder">Create My Shop</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rewards & Loyalty</h1>
          <p className="text-sm text-slate-500">Keep customers coming back with a loyalty program</p>
        </div>
        {program && !showSetup && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setShowSetup(true)}
          >
            <Settings className="mr-1 h-4 w-4" />
            Edit Program
          </Button>
        )}
      </div>

      {/* Setup / Edit Form */}
      {showSetup && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {program ? 'Edit Loyalty Program' : 'Set Up Your Loyalty Program'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Reward your repeat customers and keep them coming back
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Program Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Program Type</label>
              <select
                value={formType}
                onChange={e => setFormType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="points">Points (earn per dollar)</option>
                <option value="punch_card">Punch Card (earn per order)</option>
                <option value="spend_threshold">Spend Threshold</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                {formType === 'points' ? 'Points Per Dollar' : formType === 'punch_card' ? 'Points Per Order' : 'Points Per Dollar'}
              </label>
              <input
                type="number"
                min={1}
                value={formPointsPerDollar}
                onChange={e => setFormPointsPerDollar(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                {formType === 'punch_card' ? 'Punches for Reward' : 'Points for Reward'}
              </label>
              <input
                type="number"
                min={1}
                value={formThreshold}
                onChange={e => setFormThreshold(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Reward Description</label>
              <input
                type="text"
                value={formReward}
                onChange={e => setFormReward(e.target.value)}
                placeholder="e.g., 10% off your next order"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
              disabled={saving}
              onClick={saveProgram}
            >
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Zap className="mr-1 h-4 w-4" />}
              {program ? 'Save Changes' : 'Create Program'}
            </Button>
            {program && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setShowSetup(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Program Overview (when not editing) */}
      {program && !showSetup && (
        <>
          {/* Program Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Program</p>
                <Gift className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">{program.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {program.type === 'points' ? `${program.points_per_dollar} pt/$` : program.type === 'punch_card' ? 'Punch Card' : 'Spend Threshold'}
                {' '}&bull; {program.reward_threshold} pts = reward
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Members</p>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">{members.length}</p>
              <p className="mt-1 text-xs text-slate-500">Enrolled customers</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rewards Given</p>
                <Trophy className="h-5 w-5 text-green-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {members.reduce((sum, m) => sum + m.rewards_redeemed, 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{program.reward_description}</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-semibold text-amber-800">How It Works</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-800">1</div>
                <div>
                  <p className="text-sm font-medium text-amber-900">Customer Orders</p>
                  <p className="text-xs text-amber-700">Points are earned automatically with each purchase</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-800">2</div>
                <div>
                  <p className="text-sm font-medium text-amber-900">Points Accumulate</p>
                  <p className="text-xs text-amber-700">{program.points_per_dollar} point{program.points_per_dollar !== 1 ? 's' : ''} per dollar spent</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-800">3</div>
                <div>
                  <p className="text-sm font-medium text-amber-900">Earn Reward</p>
                  <p className="text-xs text-amber-700">At {program.reward_threshold} points: {program.reward_description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Loyalty Members</h2>
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Star className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No loyalty members yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Members are added automatically when customers place orders
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {members.map(member => {
                  const progress = (member.points / program.reward_threshold) * 100
                  return (
                    <div key={member.customer_email} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{member.customer_name}</p>
                          <p className="text-xs text-slate-400">{member.customer_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-700">{member.points} pts</p>
                          <p className="text-xs text-slate-400">
                            {member.rewards_redeemed} reward{member.rewards_redeemed !== 1 ? 's' : ''} earned
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Progress to next reward</span>
                          <span>{Math.min(progress, 100).toFixed(0)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* No program yet - empty state (if not showing setup) */}
      {!program && !showSetup && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Gift className="h-12 w-12 text-slate-300" />
          <div>
            <p className="text-lg font-semibold text-slate-700">No loyalty program yet</p>
            <p className="mt-1 text-sm text-slate-500">Create a rewards program to keep customers coming back</p>
          </div>
          <Button
            className="rounded-full bg-amber-700 text-white hover:bg-amber-800"
            onClick={() => setShowSetup(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Create Loyalty Program
          </Button>
        </div>
      )}
    </div>
  )
}
