'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Building2,
  BarChart3,
  Settings,
  Ticket,
  MessageSquare,
  Bell,
  ListChecks,
  BadgeCheck,
  Palette,
  Rocket,
  Eye,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  highlight?: boolean
}

interface AppNavProps {
  basePath: string // '/demo' or '/dashboard' or '' for root
  isDemo?: boolean
  user?: {
    name: string
    email: string
  }
}

export function AppNav({ basePath, isDemo = false, user }: AppNavProps) {
  const pathname = usePathname()

  // For non-demo mode with empty basePath, use /dashboard as the overview page
  const overviewHref = basePath ? basePath : (isDemo ? '/' : '/dashboard')

  const navigation: NavItem[] = [
    {
      name: 'Overview',
      href: overviewHref,
      icon: LayoutDashboard,
    },
    {
      name: 'App Builder',
      href: `${basePath}/builder`,
      icon: Rocket,
      highlight: true,
    },
    {
      name: 'Design Studio',
      href: `${basePath}/design`,
      icon: Palette,
    },
    {
      name: 'Preview',
      href: `${basePath}/preview`,
      icon: Eye,
    },
    {
      name: 'Conferences',
      href: `${basePath}/conferences`,
      icon: Calendar,
    },
    {
      name: 'Attendees',
      href: `${basePath}/attendees`,
      icon: Users,
    },
    {
      name: 'Speakers',
      href: `${basePath}/speakers`,
      icon: UserCog,
    },
    {
      name: 'Sponsors',
      href: `${basePath}/sponsors`,
      icon: Building2,
    },
    {
      name: 'Tickets',
      href: `${basePath}/tickets`,
      icon: Ticket,
    },
    {
      name: 'Messages',
      href: `${basePath}/messages`,
      icon: MessageSquare,
    },
    {
      name: 'Notifications',
      href: `${basePath}/notifications`,
      icon: Bell,
    },
    {
      name: 'Live Polls',
      href: `${basePath}/polls`,
      icon: ListChecks,
    },
    {
      name: 'Badges',
      href: `${basePath}/badges`,
      icon: BadgeCheck,
    },
    {
      name: 'Analytics',
      href: `${basePath}/analytics`,
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: `${basePath}/settings`,
      icon: Settings,
    },
  ]

  const defaultUser = {
    name: isDemo ? 'Demo User' : 'Organizer',
    email: isDemo ? 'demo@conference-os.com' : 'admin@example.com',
  }

  const displayUser = user || defaultUser

  return (
    <div className="relative flex h-screen w-72 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_70%)]" />

      {/* Logo */}
      <div className="relative flex h-20 items-center border-b border-white/70 px-6">
        <Link href={overviewHref} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-amber-400 to-teal-400 text-white shadow-soft">
            <span className="text-lg font-bold">C</span>
          </div>
          <div>
            <div className="font-display text-sm font-semibold">Conference OS</div>
            <div className="text-xs text-muted-foreground">
              {isDemo ? 'Demo Mode' : 'Organizer Suite'}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
        <div className="px-2 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Workspace
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-slate-900 text-white shadow-soft'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
                item.highlight && !isActive && 'text-primary'
              )}
            >
              <item.icon className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              {item.name}
              {item.highlight && !isActive && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  New
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="relative border-t border-white/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
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
