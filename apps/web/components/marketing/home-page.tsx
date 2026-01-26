'use client'

import Link from 'next/link'
import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ImageReveal } from '@/components/marketing/image-reveal'
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Gem,
  Play,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

const stats = [
  { label: 'Data tables live', value: '25+' },
  { label: 'Edge functions', value: '5' },
  { label: 'Languages supported', value: '12+' },
  { label: 'Realtime messaging', value: 'Live' },
]

const partners = [
  'Agenda Builder',
  'Ticketing + Check-in',
  'Networking',
  'Messaging',
  'Sponsor Tools',
  'Analytics',
  'Push Notifications',
  'Venue Maps',
]

const showcases = [
  {
    name: 'Agenda Builder',
    location: 'Scheduling & tracks',
    detail: 'Create sessions, speakers, rooms, and tracks.',
    tone: 'from-sky-500/80 to-indigo-500/80',
    image:
      'https://images.pexels.com/photos/29708277/pexels-photo-29708277.jpeg?cs=srgb&dl=pexels-bertellifotografia-29708277.jpg&fm=jpg',
  },
  {
    name: 'Check-in Ops',
    location: 'Registration + QR',
    detail: 'Ticket tiers, QR badges, and onsite check-in.',
    tone: 'from-amber-400/80 to-rose-500/80',
    image:
      'https://images.pexels.com/photos/29708259/pexels-photo-29708259.jpeg?cs=srgb&dl=pexels-bertellifotografia-29708259.jpg&fm=jpg',
  },
  {
    name: 'Sponsor Hub',
    location: 'Expo + leads',
    detail: 'Sponsor profiles, booths, and lead capture.',
    tone: 'from-emerald-400/80 to-teal-500/80',
    image:
      'https://images.pexels.com/photos/27945914/pexels-photo-27945914.jpeg?cs=srgb&dl=pexels-diva-plavalaguna-27945914.jpg&fm=jpg',
  },
]

const capabilities = [
  {
    title: 'Conference setup + branding',
    copy: 'Create events with custom logos, banners, and color systems.',
    icon: Zap,
  },
  {
    title: 'Agenda + speaker management',
    copy: 'Build tracks, rooms, sessions, and speaker lineups in one place.',
    icon: Gem,
  },
  {
    title: 'Ticketing + check-in ops',
    copy: 'Stripe-backed ticketing, QR badges, and real-time check-in.',
    icon: Compass,
  },
  {
    title: 'Realtime comms + analytics',
    copy: 'Announcements, push notifications, and live engagement metrics.',
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

const liveNow = [
  'Conference creation and branding',
  'Agenda builder with tracks, rooms, and sessions',
  'Speaker and attendee management',
  'Ticket tiers, QR badges, and check-in',
  'Networking and direct messaging',
  'Announcements with push notifications',
  'Analytics dashboard with realtime charts',
  'Venue maps + proximity networking',
  'Sponsor booths and lead capture',
  'AI recommendations + session summaries',
  'Live translation and text-to-speech announcements',
]

const comingNext = [
  'Live streaming + session replay (API ready)',
  'Real-time transcription + captions (Whisper)',
  'AR wayfinding for indoor navigation',
  'Meeting scheduler for 1:1s',
  'Session feedback and ratings',
  'Calendar sync (Google + Apple)',
]

const heroBackdrop =
  'https://images.pexels.com/photos/29708258/pexels-photo-29708258.jpeg?cs=srgb&dl=pexels-bertellifotografia-29708258.jpg&fm=jpg'

const momentGallery = [
  {
    title: 'Immersive check-in',
    detail: 'Fast lanes, badge printing, and on-site support.',
    image:
      'https://images.pexels.com/photos/7861763/pexels-photo-7861763.jpeg?cs=srgb&dl=pexels-david-oreilly-7861763.jpg&fm=jpg',
  },
  {
    title: 'Networking lounges',
    detail: 'Curated meetups with smart matchmaking.',
    image:
      'https://images.pexels.com/photos/6340567/pexels-photo-6340567.jpeg?cs=srgb&dl=pexels-rdne-6340567.jpg&fm=jpg',
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

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8 lg:px-8 2xl:max-w-[1400px]">
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
            <a href="#modules" className="transition hover:text-slate-900">
              Modules
            </a>
            <a href="#capabilities" className="transition hover:text-slate-900">
              Capabilities
            </a>
            <a href="#live" className="transition hover:text-slate-900">
              Live now
            </a>
            <a href="#launch" className="transition hover:text-slate-900">
              Launch
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

        <section className="relative z-10 mx-auto flex min-h-[90vh] w-full max-w-7xl flex-col justify-center px-6 pb-16 pt-4 lg:px-8 lg:pb-24 lg:pt-10 2xl:max-w-[1400px]">
          <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.45),_transparent_70%)] blur-3xl animate-drift" />
          <div
            className="pointer-events-none absolute -right-20 top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.35),_transparent_70%)] blur-3xl animate-drift"
            style={{ animationDelay: '4s' }}
          />
          <div
            className="pointer-events-none absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(20,184,166,0.35),_transparent_70%)] blur-3xl animate-pulse-glow"
            style={{ animationDelay: '1.5s' }}
          />
          <motion.div
            className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16"
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
                <h1 className="font-display text-4xl font-semibold leading-[1.05] text-slate-900 md:text-6xl">
                  The operating system for{' '}
                  <span className="text-gradient">conference leaders</span>.
                </h1>
                <p className="text-base text-slate-600 md:text-lg">
                  Conference OS runs the full organizer workflow - from
                  conference setup and ticketing to live engagement, analytics,
                  and attendee networking. Built for modern event teams.
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
              <div className="relative mt-8 overflow-hidden rounded-full border border-white/70 bg-white/70 py-2">
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/70 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/70 to-transparent" />
                <div className="flex w-[200%] animate-[marquee_18s_linear_infinite] items-center gap-10 px-6 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  {partners.concat(partners).map((partner, index) => (
                    <span key={`${partner}-${index}`}>{partner}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div className="relative" variants={fadeUp}>
              <div className="absolute -right-10 top-6 hidden h-28 w-28 rounded-full border border-white/70 lg:block" />
              <div className="relative h-[440px] overflow-hidden rounded-[32px] border border-white/70 bg-white/40 p-6 shadow-soft backdrop-blur-xl">
                <ImageReveal
                  src={heroBackdrop}
                  alt="Conference keynote with spotlight and large screen"
                  className="pointer-events-none absolute inset-0"
                  imageClassName="object-cover"
                  overlayClassName="bg-gradient-to-tr from-slate-950/70 via-slate-900/30 to-transparent"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  withRing={false}
                  withHover={false}
                />
                <motion.div
                  className="glass-panel relative h-full rounded-3xl p-6"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Live command
                    </p>
                    <span className="text-xs font-semibold text-emerald-600">
                      Syncing
                    </span>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Main stage keynote
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        3:00 PM - 4:00 PM, Hall A
                      </p>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200/80">
                        <div className="h-1.5 w-[78%] rounded-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Sponsor lounge
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        120 VIPs checked in
                      </p>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200/80">
                        <div className="h-1.5 w-[64%] rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Streaming uplink
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Low latency, 14 locations
                      </p>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200/80">
                        <div className="h-1.5 w-[88%] rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -left-8 -top-10 hidden w-52 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft lg:block"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Brand layer
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    4 new moments shipped
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Agenda, stage, and app visuals updated.
                  </p>
                </motion.div>

                <motion.div
                  className="absolute -bottom-8 right-6 hidden w-56 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft lg:block"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Experience score
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    92
                  </p>
                  <p className="mt-2 text-xs text-emerald-600">+12 uplift</p>
                </motion.div>
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
        id="modules"
        className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="flex flex-wrap items-end justify-between gap-6" variants={fadeUp}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Modules live today
            </p>
            <h2 className="font-display mt-3 text-3xl text-slate-900 md:text-4xl">
              Built for organizers. Ready for launch.
            </h2>
          </div>
          <Button variant="outline" className="rounded-full border-white/70 bg-white/80">
            View all modules
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div className="mt-10 grid gap-6 lg:grid-cols-3" variants={stagger}>
          {showcases.map((item) => (
            <motion.div
              key={item.name}
              className="relative h-[320px]"
              variants={fadeUp}
            >
              <ImageReveal
                src={item.image}
                alt={`${item.name} conference highlight`}
                className="h-full border border-white/70 shadow-soft"
                overlayClassName="bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"
                sizes="(max-width: 1024px) 100vw, 33vw"
              >
                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.tone}`} />
                </div>
                <div className="relative flex h-full flex-col justify-end p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    {item.location}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">{item.detail}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    View module
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </ImageReveal>
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
        <motion.div className="grid gap-6 lg:grid-cols-2" variants={stagger}>
          {momentGallery.map((moment) => (
            <motion.div
              key={moment.title}
              className="relative h-[320px]"
              variants={fadeUp}
            >
              <ImageReveal
                src={moment.image}
                alt={moment.title}
                className="h-full border border-white/70 shadow-soft"
                overlayClassName="bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent"
                sizes="(max-width: 1024px) 100vw, 50vw"
              >
                <div className="flex h-full items-end p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                      Experience moment
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      {moment.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/80">
                      {moment.detail}
                    </p>
                  </div>
                </div>
              </ImageReveal>
            </motion.div>
          ))}
        </motion.div>
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
        id="live"
        className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div className="glass-panel rounded-3xl p-6" variants={fadeUp}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Live today
                </p>
                <h3 className="font-display mt-2 text-xl text-slate-900">
                  Organizer platform features
                </h3>
              </div>
              <Sparkles className="h-6 w-6 text-slate-500" />
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {liveNow.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div className="glass-panel rounded-3xl p-6" variants={fadeUp}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Coming next
                </p>
                <h3 className="font-display mt-2 text-xl text-slate-900">
                  Roadmap in progress
                </h3>
              </div>
              <Compass className="h-6 w-6 text-slate-500" />
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              {comingNext.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="launch"
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
                Let's orchestrate your next flagship event.
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
            <span>New York - Berlin - SF</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
