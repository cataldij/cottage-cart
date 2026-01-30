'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DesignSystemProvider } from '@/contexts/design-system-context'
import { DesignEditor } from '@/components/design-system/design-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Conference {
  id: string
  name: string
}

export default function DesignStudioPage() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadConferences() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('conferences')
          .select('id, name')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          setConferences(data)
          setSelectedConference(data[0])
        }
      } catch (error) {
        console.error('Error loading conferences:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConferences()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Design Studio...</p>
        </div>
      </div>
    )
  }

  if (!selectedConference) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <Sparkles className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Conferences Found</h2>
        <p className="text-muted-foreground">Create a conference first to customize its design.</p>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Design Studio</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedConference.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Conference Selector */}
          {conferences.length > 1 && (
            <select
              value={selectedConference.id}
              onChange={(e) => {
                const conf = conferences.find(c => c.id === e.target.value)
                if (conf) setSelectedConference(conf)
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {conferences.map((conf) => (
                <option key={conf.id} value={conf.id}>
                  {conf.name}
                </option>
              ))}
            </select>
          )}

          <Button variant="outline" asChild>
            <Link href="/preview" target="_blank">
              Preview Site
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/conferences/${selectedConference.id}/settings`}>
              Classic Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <DesignSystemProvider
          conferenceId={selectedConference.id}
          demoMode={false}
        >
          <DesignEditor conferenceId={selectedConference.id} />
        </DesignSystemProvider>
      </div>
    </div>
  )
}
