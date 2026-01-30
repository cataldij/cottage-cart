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
} from 'lucide-react'

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Conferences',
    href: '/conferences',
    icon: Calendar,
  },
  {
    name: 'Attendees',
    href: '/attendees',
    icon: Users,
  },
  {
    name: 'Speakers',
    href: '/speakers',
    icon: UserCog,
  },
  {
    name: 'Sponsors',
    href: '/sponsors',
    icon: Building2,
  },
  {
    name: 'Tickets',
    href: '/tickets',
    icon: Ticket,
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    name: 'Live Polls',
    href: '/polls',
    icon: ListChecks,
  },
  {
    name: 'Badges',
    href: '/badges',
    icon: BadgeCheck,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="relative flex h-screen w-72 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_70%)]" />
      {/* Logo */}
      <div className="relative flex h-20 items-center border-b border-white/70 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-amber-400 to-teal-400 text-white shadow-soft">
            <span className="text-lg font-bold">C</span>
          </div>
          <div>
            <div className="font-display text-sm font-semibold">Conference OS</div>
            <div className="text-xs text-muted-foreground">Organizer Suite</div>
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
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
              )}
            >
              <item.icon className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              {item.name}
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
            <div className="truncate text-sm font-medium">Organizer</div>
            <div className="truncate text-xs text-muted-foreground">
              admin@example.com
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
