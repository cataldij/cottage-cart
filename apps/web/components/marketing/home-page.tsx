'use client'

import Link from 'next/link'
import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Compass,
  Gem,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'

const stats = [
  { label: 'Conferences shipped', value: '420+' },
  { label: 'Attendees orchestrated', value: '1.8M' },
  { label: 'Average NPS', value: '74' },
  { label: 'Countries', value: '38' },
]

const showcases = [
  {
    name: 'Signal Summit',
    location: 'New York',
    detail: 'Hybrid keynote with 42 sessions',
    tone: 'from-sky-500/80 to-indigo-500/80',
  },
  {
    name: 'Nova Product Week',
    location: 'Berlin',
    detail: 'Sponsor experience redesign',
    tone: 'from-amber-400/80 to-rose-500/80',
  },
  {
    name: 'Atlas Builders Live',
    location: 'San Francisco',
    detail: '150 speakers across 12 stages',
    tone: 'from-emerald-400/80 to-teal-500/80',
  },
]

const capabilities = [
  {
    title: 'Real-time control',
    copy: 'Operate check-ins, content, and comms from a single command layer.',
    icon: Zap,
  },
  {
    title: 'Elevated sponsor value',
    copy: 'Premium booth flows and measurable engagement for partners.',
    icon: Gem,
  },
  {
    title: 'Delightful attendee journeys',
    copy: 'Personalized agendas, networking, and smart notifications.',
    icon: Compass,
  },
  {
    title: 'Enterprise-grade security',
    copy: 'Role-based access and compliance-ready data handling.',
    icon: ShieldCheck,
  },
]

const steps = [
  {
    title: 'Design the experience',
    detail: 'Storyline-first schedule builder and branded attendee flows.',
  },
  {
    title: 'Launch with confidence',
    detail: 'Check-in ops, live translation, and AI session insights.',
  },
  {
    title: 'Measure impact',
    detail: 'Engagement telemetry and sponsor ROI analytics.',
  },
]

const testimonials = [
  {
    quote:
      'Conference OS felt like a creative studio and ops command center in one. We doubled retention.',
    name: 'Maya Patel',
    role: 'VP Experiences, Signal Labs',
  },
  {
    quote:
      'Our sponsors finally had a premium digital booth and a real story to tell.',
    name: 'Javier Moreno',
    role: 'Director of Growth, Atlas',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

export default function HomePage() {
  const [cursor, setCursor] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setCursor({ x: event.clientX, y: event.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div
      className="bg-hero"
      style={
        {
          '--cursor-x': `${cursor.x}px`,
          '--cursor-y': `${cursor.y}px`,
        } as CSSProperties
      }
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />
        <div className="pointer-events-none absolute inset-0 cursor-glow" />
        <div className="pointer-events-none absolute inset-0 cursor-glow-amber" />

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-amber-400 to-teal-400 text-white shadow-soft">
              <span className="text-lg font-bold">C</span>
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">
                Conference OS
              </p>
              <p className="text-xs text-slate-500">World-class orchestration</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#work" className="transition hover:text-slate-900">
              Work
            </a>
            <a href="#capabilities" className="transition hover:text-slate-900">
              Capabilities
            </a>
            <a href="#insights" className="transition hover:text-slate-900">
              Insights
            </a>
            <a href="#team" className="transition hover:text-slate-900">
              Team
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden rounded-full md:inline-flex">
              Get a demo
            </Button>
            <Button asChild className="rounded-full bg-slate-900 text-white shadow-soft">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </header>

        <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-4 lg:px-8 lg:pb-28">
          <motion.div
            className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div className="space-y-8" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]" />
                Product studio meets command center
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-semibold leading-tight text-slate-900 md:text-6xl">
                  Build conferences that feel{' '}
                  <span className="text-gradient">unforgettable</span>.
                </h1>
                <p className="text-base text-slate-600 md:text-lg">
                  Conference OS blends creative storytelling, live operations,
                  and AI intelligence into a single system. Everything you need
                  to move from first sketch to showtime.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button className="rounded-full bg-slate-900 px-6 text-white shadow-soft hover:bg-slate-800">
                  Start a pilot
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/70 bg-white/80 px-6 shadow-soft"
                >
                  Watch the reel
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {stats.map((item) => (
                  <div key={item.label} className="glass-panel rounded-2xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="space-y-6" variants={fadeUp}>
              <div className="glass-panel rounded-3xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Studio schedule
                  </p>
                  <span className="text-xs font-semibold text-emerald-600">
                    Live
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {['Experience design', 'Speaker ops', 'Sponsor suite'].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <p className="text-sm font-semibold text-slate-900">
                            {item}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500">In progress</p>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="glass-panel rounded-3xl p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Immersive agenda
                  </p>
                  <Sparkles className="h-5 w-5 text-slate-500" />
                </div>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Keynote: The Future of Experience
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      2:00 PM - 3:00 PM, Main Theater
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      AI Workshops and Labs
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      3:15 PM - 5:30 PM, Studio B
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-3xl border border-white/70 bg-white/80 px-6 py-4 shadow-soft">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Next sprint
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Sponsor activations review
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500" />
              </div>
            </motion.div>
          </motion.div>
          <div className="mt-14 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            <span className="h-px w-12 bg-slate-300/70" />
            Scroll
          </div>
        </section>
      </div>

      <motion.section
        id="work"
        className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="flex flex-wrap items-end justify-between gap-6" variants={fadeUp}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Featured work
            </p>
            <h2 className="font-display mt-3 text-3xl text-slate-900 md:text-4xl">
              Conferences crafted with intention.
            </h2>
          </div>
          <Button variant="outline" className="rounded-full border-white/70 bg-white/80">
            View all case studies
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div className="mt-10 grid gap-6 lg:grid-cols-3" variants={stagger}>
          {showcases.map((item) => (
            <motion.div
              key={item.name}
              className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.tone} opacity-0 transition duration-500 group-hover:opacity-100`}
              />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.location}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  View case
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="capabilities"
        className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end" variants={fadeUp}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Capabilities
            </p>
            <h2 className="font-display mt-3 text-3xl text-slate-900 md:text-4xl">
              Everything teams need to orchestrate.
            </h2>
          </div>
          <div className="text-sm text-slate-600">
            We blend intelligent planning, in-the-moment operations, and branded
            storytelling to create experiences that feel effortless. This is a
            system built for modern conference teams.
          </div>
        </motion.div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {capabilities.map((item) => (
            <motion.div key={item.title} className="glass-panel rounded-3xl p-6" variants={fadeUp}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="glass-panel rounded-[32px] p-8 lg:p-12" variants={fadeUp}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                The method
              </p>
              <h2 className="font-display text-3xl text-slate-900 md:text-4xl">
                A premium workflow from ideation to showtime.
              </h2>
              <p className="text-sm text-slate-600">
                Conference OS is structured to feel like a creative studio with
                an operational backbone. Every moment is intentional.
              </p>
              <Button className="rounded-full bg-slate-900 text-white shadow-soft">
                See the workflow
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        id="insights"
        className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div className="space-y-6" variants={fadeUp}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Client feedback
              </p>
              <h2 className="font-display mt-3 text-3xl text-slate-900 md:text-4xl">
                Trusted by teams pushing the category forward.
              </h2>
            </div>
            <div className="grid gap-6">
              {testimonials.map((item) => (
                <div key={item.name} className="glass-panel rounded-3xl p-6">
                  <div className="flex items-center gap-2 text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{item.quote}</p>
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="glass-panel rounded-3xl p-6" variants={fadeUp}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Accolades
                </p>
                <h3 className="font-display mt-2 text-xl text-slate-900">
                  Awards + press
                </h3>
              </div>
              <Award className="h-6 w-6 text-slate-500" />
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-500" />
                Event Tech 50 - Best Organizer Platform
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-500" />
                Fast Company - Design Systems for Live Events
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-500" />
                Product Hunt - Top Launch of the Month
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-white/70 bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Social proof
                </p>
                <Layers className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                120,000+ organizers follow our updates.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="team"
        className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 lg:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="glass-panel rounded-[32px] p-10" variants={fadeUp}>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Ready to build?
              </p>
              <h2 className="font-display mt-3 text-3xl text-slate-900 md:text-4xl">
                Let’s orchestrate your next flagship event.
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full bg-slate-900 px-6 text-white shadow-soft">
                Book a call
              </Button>
              <Button variant="outline" className="rounded-full border-white/70 bg-white/80 px-6">
                Download deck
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-16 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/70 pt-8 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Conference OS Studio</span>
          </div>
          <div className="flex items-center gap-6">
            <span>hello@conferenceos.com</span>
            <span>New York · Berlin · SF</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
