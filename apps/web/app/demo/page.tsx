import Link from 'next/link'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DEMO_CONFERENCE, DEMO_SESSIONS, DEMO_TRACKS } from '@/lib/demo-data'
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
  Palette,
} from 'lucide-react'

// Demo mock data
const demoData = {
  conferences: [DEMO_CONFERENCE],
  totalConferences: 3,
  totalAttendees: 4827,
  totalSessions: 124,
  totalTickets: 3892,
  totalMessages: 12847,
}

export default function DemoPage() {
  const stats = [
    {
      name: 'Total Conferences',
      value: demoData.totalConferences,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Calendar,
      progress: 72,
    },
    {
      name: 'Total Attendees',
      value: demoData.totalAttendees,
      change: '+23.1%',
      changeType: 'positive' as const,
      icon: Users,
      progress: 64,
    },
    {
      name: 'Tickets Sold',
      value: demoData.totalTickets,
      change: '+18.2%',
      changeType: 'positive' as const,
      icon: Ticket,
      progress: 81,
    },
    {
      name: 'Messages Sent',
      value: demoData.totalMessages,
      change: '+32.8%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      progress: 76,
    },
  ]

  const pulse = [
    {
      label: 'Check-in velocity',
      value: `${formatNumber(demoData.totalAttendees)} checked in`,
      trend: '+18%',
      progress: 76,
      tone: 'from-emerald-400 to-teal-400',
    },
    {
      label: 'Sessions ready',
      value: `${formatNumber(demoData.totalSessions)} scheduled`,
      trend: '+6%',
      progress: 58,
      tone: 'from-sky-400 to-blue-500',
    },
    {
      label: 'Ticket momentum',
      value: `${formatNumber(demoData.totalTickets)} sold`,
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
                <Link href="/demo/design">
                  <Palette className="mr-2 h-4 w-4" />
                  Try Design Studio
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full border-white/70 bg-white/80 px-5 text-slate-700 shadow-soft hover:bg-white"
              >
                <Link href="/register">Sign up free</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Active programs
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {formatNumber(demoData.totalConferences)}
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
                  {formatNumber(demoData.totalAttendees)}
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
          <div className="mt-6 space-y-4">
            {[
              { id: '1', name: DEMO_CONFERENCE.name, start_date: DEMO_CONFERENCE.start_date, end_date: DEMO_CONFERENCE.end_date },
              { id: '2', name: 'DevOps Summit 2024', start_date: '2024-10-20', end_date: '2024-10-22' },
              { id: '3', name: 'AI Innovation Forum', start_date: '2024-11-05', end_date: '2024-11-07' },
            ].map((conference) => (
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
              <Link href="/demo/design" className="group flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Palette className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Design Studio
                </p>
                <p className="text-xs text-slate-500">
                  AI-powered branding in seconds.
                </p>
              </Link>
              <Link href="/register" className="group flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
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
              <Link href="/register" className="group flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
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
              <Link href="/register" className="group flex flex-col gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft">
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
