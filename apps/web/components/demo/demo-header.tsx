'use client'

import { Bell, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDemoMode } from '@/contexts/demo-mode-context'

export function DemoHeader() {
  const { showDemoAlert } = useDemoMode()

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/70 bg-white/75 px-8 backdrop-blur-xl">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            placeholder="Search conferences, attendees, sessions..."
            className="h-11 border-white/80 bg-white/80 pl-10 pr-14 text-sm shadow-soft ring-1 ring-transparent transition focus-visible:ring-primary/30"
            onFocus={showDemoAlert}
          />
          <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white/90 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500 md:block">
            Ctrl K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={showDemoAlert}
          className="hidden items-center gap-2 rounded-full bg-slate-900 px-4 text-white shadow-soft transition hover:bg-slate-800 md:flex"
        >
          <Plus className="h-4 w-4" />
          New conference
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="relative border-white/70 bg-white/80"
          onClick={showDemoAlert}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  )
}
