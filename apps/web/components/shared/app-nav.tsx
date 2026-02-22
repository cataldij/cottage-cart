'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  Plus,
  Users,
  Calculator,
  MessageCircle,
  Bell,
  Store,
  ShieldCheck,
  Tag,
  TrendingUp,
  Gift,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  highlight?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface AppNavProps {
  basePath: string
  isDemo?: boolean
  user?: {
    name: string
    email: string
  }
}

export function AppNav({ basePath, isDemo = false, user }: AppNavProps) {
  const pathname = usePathname()

  const overviewHref = basePath ? basePath : (isDemo ? '/' : '/dashboard')

  const sections: NavSection[] = [
    {
      title: 'Main',
      items: [
        {
          name: 'Overview',
          href: overviewHref,
          icon: LayoutDashboard,
        },
        {
          name: 'My Shop',
          href: `${basePath}/builder`,
          icon: Store,
          highlight: true,
        },
      ],
    },
    {
      title: 'Products',
      items: [
        {
          name: 'Products',
          href: `${basePath}/products`,
          icon: UtensilsCrossed,
        },
        {
          name: 'Price Calculator',
          href: `${basePath}/calculator`,
          icon: Calculator,
          highlight: true,
        },
      ],
    },
    {
      title: 'Orders',
      items: [
        {
          name: 'Orders',
          href: `${basePath}/orders`,
          icon: ShoppingBag,
        },
        {
          name: 'Customers',
          href: `${basePath}/customers`,
          icon: Users,
        },
        {
          name: 'Revenue',
          href: `${basePath}/revenue`,
          icon: TrendingUp,
          highlight: true,
        },
      ],
    },
    {
      title: 'Compliance',
      items: [
        {
          name: 'Compliance Center',
          href: `${basePath}/compliance`,
          icon: ShieldCheck,
          highlight: true,
        },
        {
          name: 'Label Generator',
          href: `${basePath}/labels`,
          icon: Tag,
        },
      ],
    },
    {
      title: 'Engagement',
      items: [
        {
          name: 'Rewards',
          href: `${basePath}/rewards`,
          icon: Gift,
          highlight: true,
        },
        {
          name: 'Messages',
          href: `${basePath}/messages`,
          icon: MessageCircle,
        },
        {
          name: 'Notifications',
          href: `${basePath}/notifications`,
          icon: Bell,
        },
        {
          name: 'Settings',
          href: `${basePath}/settings`,
          icon: Settings,
        },
      ],
    },
  ]

  const defaultUser = {
    name: isDemo ? 'Demo User' : 'Shop Owner',
    email: isDemo ? 'demo@makersmarket.com' : 'owner@example.com',
  }

  const displayUser = user || defaultUser

  return (
    <div className="relative flex h-screen w-72 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.14),_transparent_70%)]" />

      {/* Logo */}
      <div className="relative flex h-20 items-center border-b border-white/70 px-6">
        <Link href={overviewHref} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 text-white shadow-soft">
            <span className="text-lg font-bold">M</span>
          </div>
          <div>
            <div className="font-display text-sm font-semibold">Maker's Market</div>
            <div className="text-xs text-muted-foreground">
              {isDemo ? 'Demo Mode' : 'Shop Dashboard'}
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Action: Create Shop */}
      <div className="relative px-4 pt-4">
        <Link
          href={`${basePath}/builder`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-amber-700 hover:to-orange-700 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Edit My Shop
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-6 overflow-y-auto p-4 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-2 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-amber-800 text-white shadow-soft'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
                      item.highlight && !isActive && 'text-amber-700'
                    )}
                  >
                    <item.icon className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="relative border-t border-white/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1 truncate">
            <div className="truncate text-sm font-medium">{displayUser.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {displayUser.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
