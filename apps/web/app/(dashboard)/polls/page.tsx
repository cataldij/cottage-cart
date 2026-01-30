// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, Play, Pause, Eye } from 'lucide-react'

async function createPollAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sessionId = String(formData.get('session_id') || '')
  const question = String(formData.get('question') || '').trim()
  const optionsInput = String(formData.get('options') || '')
  const options = optionsInput
    .split(/\r?\n/)
    .map((option) => option.trim())
    .filter(Boolean)

  if (!sessionId || !question || options.length === 0) {
    redirect('/polls')
  }

  const payload = {
    session_id: sessionId,
    question,
    options,
    is_active: formData.get('is_active') === 'on',
    show_results: formData.get('show_results') === 'on',
  }

  const { error } = await supabase.from('polls').insert(payload)
  if (error) throw new Error(error.message)

  redirect('/polls')
}

async function updatePollStatusAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const pollId = String(formData.get('poll_id') || '')
  const nextActive = formData.get('is_active') === 'true'

  const { error } = await supabase
    .from('polls')
    .update({
      is_active: nextActive,
      closed_at: nextActive ? null : new Date().toISOString(),
    })
    .eq('id', pollId)

  if (error) throw new Error(error.message)

  redirect('/polls')
}

async function updatePollResultsAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const pollId = String(formData.get('poll_id') || '')
  const showResults = formData.get('show_results') === 'true'

  const { error } = await supabase
    .from('polls')
    .update({ show_results: showResults })
    .eq('id', pollId)

  if (error) throw new Error(error.message)

  redirect('/polls')
}

async function getPollsData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!conferences || conferences.length === 0) {
    return { conference: null, sessions: [], polls: [] }
  }

  const conferenceId = conferences[0].id

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, start_time')
    .eq('conference_id', conferenceId)
    .order('start_time', { ascending: true })

  const sessionIds = (sessions || []).map((session) => session.id)

  let polls: any[] = []
  if (sessionIds.length > 0) {
    const { data: pollsData } = await supabase
      .from('polls')
      .select(
        `id, session_id, question, options, is_active, show_results, created_at, closed_at,
        session:sessions(title, start_time),
        responses:poll_responses(count)`
      )
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })

    polls = pollsData || []
  }

  return { conference: conferences[0], sessions: sessions || [], polls }
}

export default async function PollsPage() {
  const { conference, sessions, polls } = await getPollsData()

  if (!conference) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Live Polls</h1>
        <p className="text-muted-foreground">Create a conference first.</p>
        <Button asChild>
          <Link href="/conferences/new">Create Conference</Link>
        </Button>
      </div>
    )
  }

  const totalResponses = polls.reduce(
    (sum, poll) => sum + (poll.responses?.[0]?.count || 0),
    0
  )
  const activePolls = polls.filter((poll) => poll.is_active).length

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Polls</h1>
          <p className="text-muted-foreground">
            Create and control live polls for {conference.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{polls.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Poll</CardTitle>
          <CardDescription>Launch a live poll for a session.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add sessions before creating polls.
              </p>
              <Button asChild>
                <Link href="/sessions/new">Create Session</Link>
              </Button>
            </div>
          ) : (
            <form action={createPollAction} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Session</label>
                <select
                  name="session_id"
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Question</label>
                <input
                  name="question"
                  placeholder="What topic should we dive into next?"
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Options</label>
                <textarea
                  name="options"
                  rows={4}
                  placeholder="One option per line"
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_active" />
                Activate immediately
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="show_results" />
                Show results to audience
              </label>
              <div className="md:col-span-2">
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Poll
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poll Library</CardTitle>
          <CardDescription>{polls.length} polls created</CardDescription>
        </CardHeader>
        <CardContent>
          {polls.length === 0 ? (
            <p className="text-sm text-muted-foreground">No polls yet.</p>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const responseCount = poll.responses?.[0]?.count || 0
                return (
                  <div key={poll.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{poll.session?.title}</p>
                        <p className="mt-1 font-semibold">{poll.question}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {Array.isArray(poll.options)
                            ? poll.options.join(' • ')
                            : ''}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{responseCount} responses</p>
                        <p>{poll.is_active ? 'Active' : 'Inactive'}</p>
                        <p>{poll.show_results ? 'Results visible' : 'Results hidden'}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={updatePollStatusAction}>
                        <input type="hidden" name="poll_id" value={poll.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={poll.is_active ? 'false' : 'true'}
                        />
                        <Button variant="outline" size="sm" type="submit">
                          {poll.is_active ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Close poll
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      </form>
                      <form action={updatePollResultsAction}>
                        <input type="hidden" name="poll_id" value={poll.id} />
                        <input
                          type="hidden"
                          name="show_results"
                          value={poll.show_results ? 'false' : 'true'}
                        />
                        <Button variant="outline" size="sm" type="submit">
                          <Eye className="mr-2 h-4 w-4" />
                          {poll.show_results ? 'Hide results' : 'Show results'}
                        </Button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

