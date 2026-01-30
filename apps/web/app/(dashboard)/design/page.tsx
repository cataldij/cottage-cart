import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Sparkles, Palette } from 'lucide-react'
import { DesignStudioClient } from './client'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

interface Conference {
  id: string
  name: string
  slug: string
}

async function getConferences(): Promise<Conference[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  console.log('[Design Studio] Fetching conferences for user:', user.id)

  const { data, error } = await supabase
    .from('conferences')
    .select('id, name, slug')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Design Studio] Error fetching conferences:', error)
  }

  console.log('[Design Studio] Found conferences:', data?.length || 0)

  return data || []
}

export default async function DesignStudioPage() {
  const conferences = await getConferences()

  if (conferences.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-purple-100 p-4">
          <Sparkles className="h-12 w-12 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold">No Conferences Yet</h2>
        <p className="max-w-md text-center text-muted-foreground">
          Create your first conference to start customizing its design with the Design Studio.
        </p>
        <Button asChild className="mt-2">
          <Link href="/conferences/new">
            <Palette className="mr-2 h-4 w-4" />
            Create Conference
          </Link>
        </Button>
      </div>
    )
  }

  return <DesignStudioClient conferences={conferences} />
}
