// @ts-nocheck
// TODO: Fix Supabase type inference issues
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Activity,
  ArrowUpRight,
  Building2,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Radar,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

async function getDashboardData() {
  const supabase = await createClient()

  // Get user's conferences
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get conferences where user is organizer
  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name, start_date, end_date')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const conferenceIds = conferences?.map((c) => c.id) || []

  // Handle empty conference case
  if (conferenceIds.length === 0) {
    return {
      conferences: [],
      totalConferences: 0,
      totalAttendees: 0,
      totalSessions: 0,
      totalTickets: 0,
      totalMessages: 0,
    }
  }

  // Get chat room IDs for message count query
  const { data: chatRooms } = await supabase
    .from('chat_rooms')
    .select('id')
    .in('conference_id', conferenceIds)

  const chatRoomIds = chatRooms?.map((r) => r.id) || []

  // Get stats
  const [
    { count: totalAttendees },
    { count: totalSessions },
    { count: totalTickets },
    messagesResult,
  ] = await Promise.all([
    supabase
      .from('conference_members')
      .select('*', { count: 'exact', head: true })
      .in('conference_id', conferenceIds),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .in('conference_id', conferenceIds),
    supabase
      .from('conference_members')
      .select('*', { count: 'exact', head: true })
      .in('conference_id', conferenceIds)
      .not('ticket_code', 'is', null),
    chatRoomIds.length > 0
      ? supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('room_id', chatRoomIds)
      : Promise.resolve({ count: 0 }),
  ])

  const totalMessages = messagesResult.count || 0

  return {
    conferences: conferences || [],
    totalConferences: conferences?.length || 0,
    totalAttendees: totalAttendees || 0,
    totalSessions: totalSessions || 0,
    totalTickets: totalTickets || 0,
    totalMessages,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return <div>Loading...</div>
  }

  const stats = [
    {
      name: 'Total Conferences',
      value: data.totalConferences,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Calendar,
      progress: 72,
    },
    {
      name: 'Total Attendees',
      value: data.totalAttendees,
      change: '+23.1%',
      changeType: 'positive' as const,
      icon: Users,
      progress: 64,
    },
    {
      name: 'Tickets Sold',
      value: data.totalTickets,
      change: '+18.2%',
      changeType: 'positive' as const,
      icon: Ticket,
      progress: 81,
    },
    {
      name: 'Messages Sent',
      value: data.totalMessages,
      change: '+32.8%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      progress: 76,
    },
  ]

  const pulse = [
    {
      label: 'Check-in velocity',
      value: `${formatNumber(data.totalAttendees)} checked in`,
      trend: '+18%',
      progress: 76,
      tone: 'from-emerald-400 to-teal-400',
    },
    {
      label: 'Sessions ready',
      value: `${formatNumber(data.totalSessions)} scheduled`,
      trend: '+6%',
      progress: 58,
      tone: 'from-sky-400 to-blue-500',
    },
    {
      label: 'Ticket momentum',
      value: `${formatNumber(data.totalTickets)} sold`,
      trend: '+24%',
      progress: 84,
      tone: 'from-amber-400 to-orange-500',
    },
  ]

  const actionQueue = [
    {
      title: 'Finalize sponsor deck',
      detail: '2 approvals pending',
      icon: Zap,
      tone: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Confirm stage lighting',
      detail: 'Vendor ETA: 45 min',
      icon: Sparkles,
      tone: 'bg-sky-100 text-sky-700',
    },
    {
      title: 'Update room capacity',
      detail: 'Hall B exceeds demand',
      icon: Radar,
      tone: 'bg-emerald-100 text-emerald-700',
    },
  ]

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur-xl animate-rise">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.35),_transparent_70%)] opacity-70 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(20,184,166,0.35),_transparent_70%)] opacity-70 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]" />
              Live control center
            </div>
            <div>
              <h1 className="font-display text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                Orchestrate <span className="text-gradient">world-class</span>{' '}
                conferences.
              </h1>
              <p className="mt-4 text-sm text-muted-foreground md:text-base">
                Design the agenda, energize the audience, and keep operations
                flawless with one intelligent command center.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-slate-900 px-5 text-white shadow-soft hover:bg-slate-800">
                <Link href="/conferences/new">Create conference</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full border-white/70 bg-white/80 px-5 text-slate-700 shadow-soft hover:bg-white"
              >
                <Link href="/attendees/invite">Invite team</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Active programs
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatNumber(data.totalConferences)}
                </p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200/80">
                  <div className="h-1.5 w-[68%] rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Live attendees
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatNumber(data.totalAttendees)}
                </p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200/80">
                  <div className="h-1.5 w-[74%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Conference pulse
                  </p>
                  <h3 className="font-display mt-2 text-xl text-slate-900">
                    Engagement rising
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {pulse.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/70 bg-white/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {item.value}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-emerald-600">
                        {item.trend}
                      </p>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200/80">
                      <div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${item.tone}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Next milestone
                  </p>
                  <h3 className="font-display mt-2 text-xl text-slate-900">
                    Keynote: Future of AI
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Today, 3:00 PM
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Main Hall A
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Run of show
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    Lighting, audio, stage cue checks in progress
                  </p>
                </div>
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                  Open
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="glass-panel group rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl animate-rise"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {stat.name}
              </p>
              <stat.icon className="h-5 w-5 text-slate-500 transition group-hover:-translate-y-0.5" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold text-slate-900">
                {formatNumber(stat.value)}
              </p>
              <p
                className={`text-xs font-semibold ${
                  stat.changeType === 'positive'
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {stat.change}
              </p>
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-slate-200/80">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500"
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl text-slate-900">
                Recent conferences
              </h3>
              <p className="text-sm text-muted-foreground">
                Your most recently created conferences
              </p>
            </div>
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
              View all
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          {data.conferences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-semibold">
                No conferences yet
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get started by creating your first conference
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {data.conferences.slice(0, 5).map((conference) => (
                <div
                  key={conference.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {conference.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conference.start_date).toLocaleDateString()} -{' '}
                      {new Date(conference.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                    Open brief
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl text-slate-900">
                  Operations queue
                </h3>
                <p className="text-sm text-muted-foreground">Priority tasks</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Today
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {actionQueue.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/80 p-4"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                    Review
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-slate-900">
                Quick actions
              </h3>
              <TrendingUp className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/conferences/new" className="group flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Create conference
                </p>
                <p className="text-xs text-slate-500">
                  Build the next event in minutes.
                </p>
              </Link>
              <Link href="/sponsors" className="group flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Add sponsor
                </p>
                <p className="text-xs text-slate-500">
                  Launch a premium booth experience.
                </p>
              </Link>
              <Link href="/analytics" className="group flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  View analytics
                </p>
                <p className="text-xs text-slate-500">
                  Track engagement in real time.
                </p>
              </Link>
              <Link href="/check-in" className="group flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Launch check-in
                </p>
                <p className="text-xs text-slate-500">
                  Start scanning attendees now.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
