'use client'

import Link from 'next/link'
import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ImageReveal } from '@/components/marketing/image-reveal'
import {
  ArrowRight,
  ArrowUpRight,
  ChefHat,
  CookingPot,
  Flame,
  Heart,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react'

const stats = [
  { label: 'States covered', value: '50' },
  { label: 'Setup time', value: '10 min' },
  { label: 'Starting at', value: 'Free' },
  { label: 'Compliance', value: 'Built-in' },
]

const categories = [
  'Porch Bakeries',
  'Home Chocolatiers',
  'Hot Sauce Makers',
  'Food Trucks',
  'Jams & Preserves',
  'Specialty Foods',
  'Artisan Breads',
  'Cookie Decorators',
]

const showcases = [
  {
    name: 'Porch Bakeries',
    location: 'Breads, pastries & more',
    detail: 'Take pre-orders and schedule porch pickups for your fresh-baked goods.',
    tone: 'from-amber-500/80 to-orange-600/80',
    image:
      'https://images.pexels.com/photos/1556698/pexels-photo-1556698.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Hot Sauce Makers',
    location: 'Small-batch & craft',
    detail: 'Showcase your lineup, take orders, and build your brand.',
    tone: 'from-red-500/80 to-rose-600/80',
    image:
      'https://images.pexels.com/photos/4197444/pexels-photo-4197444.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    name: 'Home Chocolatiers',
    location: 'Truffles, bars & bonbons',
    detail: 'Feature seasonal collections and custom gift boxes.',
    tone: 'from-amber-800/80 to-yellow-900/80',
    image:
      'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
]

const capabilities = [
  {
    title: 'State compliance, handled',
    copy: 'Revenue caps, permits, food handler certs, and labeling requirements - tracked for your state automatically.',
    icon: Store,
  },
  {
    title: 'Compliant label generator',
    copy: 'Generate labels with correct allergens, disclaimers, and state-specific wording. Print-ready.',
    icon: UtensilsCrossed,
  },
  {
    title: 'AI-powered recipe pricing',
    copy: 'Paste a recipe, get ingredient costs, competitive pricing, and profit projections instantly.',
    icon: ShoppingBag,
  },
  {
    title: 'Storefront + orders + customers',
    copy: 'Your own branded shop with ordering, customer management, loyalty rewards, and messaging.',
    icon: Heart,
  },
]

const steps = [
  {
    title: 'Set up your shop',
    detail: 'Tell us your state, add your products, and get your compliance checklist.',
  },
  {
    title: 'Stay compliant',
    detail: 'Track permits, revenue caps, labels, and certifications - all in one dashboard.',
  },
  {
    title: 'Grow your business',
    detail: 'Take orders, manage customers, and use AI pricing to maximize your profit.',
  },
]

const liveNow = [
  'Branded storefront with your own URL',
  'Product catalog with categories & allergens',
  'AI-powered recipe costing & pricing',
  'Order management dashboard',
  'State-by-state compliance tracking',
  'Revenue cap monitoring with alerts',
  'Compliant label generator',
  'Mobile-friendly for customers and makers',
]

const comingNext = [
  'Stripe payment processing',
  'Customer loyalty & rewards program',
  'In-app messaging & notifications',
  'Permit & certification tracking',
  'Revenue analytics & tax export',
  'Customer-facing mobile app',
]

const heroBackdrop =
  'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=1200'

const momentGallery = [
  {
    title: 'Porch pickup made easy',
    detail: 'Customers pre-order and pick up fresh goods right from your door.',
    image:
      'https://images.pexels.com/photos/2280545/pexels-photo-2280545.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Your menu, your rules',
    detail: 'Set what you sell, when you sell it, and how much you make.',
    image:
      'https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=800',
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 text-white shadow-soft">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">
                Maker's Market
              </p>
              <p className="text-xs text-slate-500">Run your food business, stay compliant</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#categories" className="transition hover:text-slate-900">
              Categories
            </a>
            <a href="#capabilities" className="transition hover:text-slate-900">
              Features
            </a>
            <a href="#live" className="transition hover:text-slate-900">
              What&apos;s live
            </a>
            <a href="#launch" className="transition hover:text-slate-900">
              Get started
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="hidden rounded-full md:inline-flex">
              <Link href="/shops">Browse shops</Link>
            </Button>
            <Button asChild className="rounded-full bg-amber-700 text-white shadow-soft hover:bg-amber-800">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </header>

        <section className="relative z-10 mx-auto flex min-h-[90vh] w-full max-w-7xl flex-col justify-center px-6 pb-16 pt-4 lg:px-8 lg:pb-24 lg:pt-10 2xl:max-w-[1400px]">
          <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.35),_transparent_70%)] blur-3xl animate-drift" />
          <div
            className="pointer-events-none absolute -right-20 top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.3),_transparent_70%)] blur-3xl animate-drift"
            style={{ animationDelay: '4s' }}
          />
          <div
            className="pointer-events-none absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(101,163,13,0.25),_transparent_70%)] blur-3xl animate-pulse-glow"
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
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.16)]" />
                From your kitchen to their doorstep
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-semibold leading-[1.05] text-slate-900 md:text-6xl">
                  Your cottage food business,{' '}
                  <span className="text-gradient">fully managed</span>.
                </h1>
                <p className="text-base text-slate-600 md:text-lg">
                  Maker's Market helps home bakers, chocolatiers, hot sauce makers, and
                  artisan food producers run their entire business - storefront, orders,
                  compliance, labels, and pricing. All in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="rounded-full bg-amber-700 px-6 text-white shadow-soft hover:bg-amber-800">
                  <Link href="/register">
                    Create your shop
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/70 bg-white/80 px-6 shadow-soft">
                  <Link href="/shops">
                    See examples
                    <Flame className="h-4 w-4" />
                  </Link>
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
                  {categories.concat(categories).map((cat, index) => (
                    <span key={`${cat}-${index}`}>{cat}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div className="relative" variants={fadeUp}>
              <div className="absolute -right-10 top-6 hidden h-28 w-28 rounded-full border border-white/70 lg:block" />
              <div className="relative h-[440px] overflow-hidden rounded-[32px] border border-white/70 bg-white/40 p-6 shadow-soft backdrop-blur-xl">
                <ImageReveal
                  src={heroBackdrop}
                  alt="Fresh baked bread on wooden cutting board"
                  className="pointer-events-none absolute inset-0"
                  imageClassName="object-cover"
                  overlayClassName="bg-gradient-to-tr from-amber-950/70 via-amber-900/30 to-transparent"
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
                      Today&apos;s orders
                    </p>
                    <span className="text-xs font-semibold text-amber-600">
                      3 new
                    </span>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Sourdough Boule (x2)
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Pickup: Saturday 10am &bull; Sarah M.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">Confirmed</span>
                        <span className="text-xs font-semibold text-slate-900">$16.00</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Habanero Mango Hot Sauce (x3)
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Pickup: Saturday 2pm &bull; Mike T.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">Ready</span>
                        <span className="text-xs font-semibold text-slate-900">$27.00</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Truffle Box (Assorted 12pc)
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Pickup: Sunday 11am &bull; Lisa K.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">Pending</span>
                        <span className="text-xs font-semibold text-slate-900">$42.00</span>
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
                    This week
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    12 orders &bull; $340 revenue
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    3 new customers discovered your shop
                  </p>
                </motion.div>

                <motion.div
                  className="absolute -bottom-8 right-6 hidden w-56 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft lg:block"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Shop rating
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    4.9
                  </p>
                  <p className="mt-2 text-xs text-amber-600">23 reviews</p>
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
        id="categories"
        className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="flex flex-wrap items-end justify-between gap-6" variants={fadeUp}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Built for every maker
            </p>
            <h2 className="font-display mt-3 text-3xl text-slate-900 md:text-4xl">
              Whatever you make, we&apos;ve got your back.
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-full border-white/70 bg-white/80">
            <Link href="/shops">
              Browse all shops
              <ArrowUpRight className="h-4 w-4" />
            </Link>
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
                alt={`${item.name} cottage food`}
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
                    See examples
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
              Features
            </p>
            <h2 className="font-display mt-3 text-3xl text-slate-900 md:text-4xl">
              Everything you need to sell from home.
            </h2>
          </div>
          <div className="text-sm text-slate-600">
            From a beautiful branded storefront to pre-order management and local
            discovery - Maker's Market handles the tech so you can focus on what
            you do best: making incredible food.
          </div>
        </motion.div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {capabilities.map((item) => (
            <motion.div key={item.title} className="glass-panel rounded-3xl p-6" variants={fadeUp}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-700 text-white">
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
                      How it works
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
                How it works
              </p>
              <h2 className="font-display text-3xl text-slate-900 md:text-4xl">
                From kitchen to customers in three steps.
              </h2>
              <p className="text-sm text-slate-600">
                Maker's Market is built to be simple. Set up your shop, check
                your compliance, and start selling. Your customers get a
                beautiful storefront. You get a business that's legal.
              </p>
              <Button asChild className="rounded-full bg-amber-700 text-white shadow-soft hover:bg-amber-800">
                <Link href="/register">
                  Create your shop
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white">
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
                  Platform features
                </h3>
              </div>
              <CookingPot className="h-6 w-6 text-slate-500" />
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {liveNow.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
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
                  On the roadmap
                </h3>
              </div>
              <Sparkles className="h-6 w-6 text-slate-500" />
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
                Ready to sell?
              </p>
              <h2 className="font-display mt-3 text-3xl text-slate-900 md:text-4xl">
                Your cottage food business starts here.
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full bg-amber-700 px-6 text-white shadow-soft hover:bg-amber-800">
                <Link href="/register">Create your shop free</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/70 bg-white/80 px-6">
                <Link href="/shops">Browse shops near you</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-16 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/70 pt-8 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-700 text-white">
              <ChefHat className="h-4 w-4" />
            </div>
            <span>Maker's Market</span>
          </div>
          <div className="flex items-center gap-6">
            <span>hello@makersmarket.com</span>
            <span>Made for makers everywhere</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

