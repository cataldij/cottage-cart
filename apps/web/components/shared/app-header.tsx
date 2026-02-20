'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOutBrowser } from '@/lib/supabase-browser'
import {
  Bell,
  Search,
  HelpCircle,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Sparkles,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AppHeaderProps {
  isDemo?: boolean
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onSignOut?: () => void
}

export function AppHeader({ isDemo = false, user, onSignOut }: AppHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1] || 'overview'

    const titles: Record<string, string> = {
      demo: 'Overview',
      dashboard: 'Overview',
      builder: 'Shop Builder',
      products: 'Menu Items',
      orders: 'Orders',
      customers: 'Customers',
      messages: 'Messages',
      notifications: 'Notifications',
      calculator: 'Price Calculator',
      compliance: 'Compliance Center',
      labels: 'Label Generator',
      settings: 'Settings',
    }

    return titles[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }

  const defaultUser = {
    name: isDemo ? 'Demo User' : 'Shop Owner',
    email: isDemo ? 'demo@cottagecart.com' : 'owner@example.com',
  }

  const displayUser = user || defaultUser

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-900">{getPageTitle()}</h1>
        {isDemo && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            Demo Mode
          </span>
        )}
      </div>

      <div className="mx-8 hidden max-w-md flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            Ctrl+K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-2 text-slate-600 hover:text-slate-900 sm:flex"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm">AI Assistant</span>
        </Button>

        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-medium text-white">
                {displayUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                {displayUser.name}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{displayUser.name}</p>
              <p className="text-xs text-muted-foreground">{displayUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isDemo ? (
              <DropdownMenuItem asChild>
                <Link href="/register" className="text-primary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sign Up for Full Access
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={async () => {
                  if (onSignOut) {
                    onSignOut()
                    return
                  }
                  try {
                    await signOutBrowser()
                  } finally {
                    router.push('/login')
                    router.refresh()
                  }
                }}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
