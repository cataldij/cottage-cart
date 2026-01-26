// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Users,
  Mic,
  Calendar,
  Mail,
  Linkedin,
  Twitter,
  Globe,
  Edit,
  Trash2,
  Search,
} from 'lucide-react'

async function removeSpeakerAction(speakerId: string) {
  'use server'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  await supabase.from('speaker_profiles').delete().eq('user_id', speakerId)
  await supabase.from('conference_members').delete().eq('user_id', speakerId)
}

async function getSpeakersData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's conferences
  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (!conferences || conferences.length === 0) {
    return { speakers: [], conference: null }
  }

  const conferenceId = conferences[0].id

  // Get speaker profiles for this conference
  const { data: speakerProfiles } = await supabase
    .from('speaker_profiles')
    .select(`
      *,
      user:profiles(
        id,
        full_name,
        email,
        avatar_url,
        linkedin_url,
        twitter_url,
        website_url
      ),
      sessions:session_speakers(
        session:sessions(id, title, start_time)
      )
    `)
    .eq('conference_id', conferenceId)

  // Also get conference members who are speakers
  const { data: speakerMembers } = await supabase
    .from('conference_members')
    .select(`
      *,
      user:profiles(
        id,
        full_name,
        email,
        avatar_url,
        company,
        job_title,
        linkedin_url,
        twitter_url,
        website_url
      )
    `)
    .eq('conference_id', conferenceId)
    .eq('role', 'speaker')

  // Merge speaker data
  const speakersMap = new Map()

  speakerMembers?.forEach((member) => {
    if (member.user) {
      speakersMap.set(member.user.id, {
        id: member.user.id,
        name: member.user.full_name,
        email: member.user.email,
        avatarUrl: member.user.avatar_url,
        company: member.user.company,
        title: member.user.job_title,
        linkedinUrl: member.user.linkedin_url,
        twitterUrl: member.user.twitter_url,
        websiteUrl: member.user.website_url,
        bio: null,
        sessions: [],
        isFeatured: false,
      })
    }
  })

  speakerProfiles?.forEach((profile) => {
    if (profile.user) {
      const existing = speakersMap.get(profile.user.id) || {}
      speakersMap.set(profile.user.id, {
        ...existing,
        id: profile.user.id,
        name: profile.user.full_name,
        email: profile.user.email,
        avatarUrl: profile.headshot_url || profile.user.avatar_url,
        company: profile.company || existing.company,
        title: profile.title || existing.title,
        linkedinUrl: profile.user.linkedin_url,
        twitterUrl: profile.user.twitter_url,
        websiteUrl: profile.user.website_url,
        bio: profile.bio,
        topics: profile.topics,
        sessions: profile.sessions?.map((s: any) => s.session).filter(Boolean) || [],
        isFeatured: profile.is_featured,
      })
    }
  })

  return {
    speakers: Array.from(speakersMap.values()),
    conference: conferences[0],
  }
}

export default async function SpeakersPage() {
  const { speakers, conference } = await getSpeakersData()

  if (!conference) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Speakers</h1>
            <p className="text-muted-foreground">
              Manage speakers for your conference
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
            <Mic className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold">No conferences yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create a conference to start adding speakers
            </p>
            <Button asChild>
              <Link href="/dashboard/conferences">
                <Plus className="mr-2 h-4 w-4" />
                Create Conference
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const featuredSpeakers = speakers.filter((s) => s.isFeatured)
  const totalSessions = speakers.reduce((sum, s) => sum + (s.sessions?.length || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speakers</h1>
          <p className="text-muted-foreground">
            Manage speakers for {conference.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/speakers/invite">
            <Plus className="mr-2 h-4 w-4" />
            Invite Speaker
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Speakers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{speakers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredSpeakers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sessions</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {speakers.length > 0 ? (totalSessions / speakers.length).toFixed(1) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search speakers..."
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Speakers Grid */}
      {speakers.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
            <Mic className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold">No speakers yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Invite speakers to present at your conference
            </p>
            <Button asChild>
              <Link href="/dashboard/speakers/invite">
                <Plus className="mr-2 h-4 w-4" />
                Invite First Speaker
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {speakers.map((speaker) => (
            <Card key={speaker.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                    {speaker.avatarUrl ? (
                      <Image
                        src={speaker.avatarUrl}
                        alt={speaker.name || 'Speaker'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                        {speaker.name?.charAt(0) || 'S'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold truncate">{speaker.name}</h3>
                        {speaker.title && (
                          <p className="text-sm text-muted-foreground truncate">
                            {speaker.title}
                          </p>
                        )}
                        {speaker.company && (
                          <p className="text-sm text-muted-foreground truncate">
                            {speaker.company}
                          </p>
                        )}
                      </div>
                      {speaker.isFeatured && (
                        <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Sessions */}
                    {speaker.sessions && speaker.sessions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          {speaker.sessions.length} session{speaker.sessions.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-1">
                          {speaker.sessions.slice(0, 2).map((session: any) => (
                            <p
                              key={session.id}
                              className="text-xs text-muted-foreground truncate"
                            >
                              - {session.title}
                            </p>
                          ))}
                          {speaker.sessions.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{speaker.sessions.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="mt-3 flex items-center gap-2">
                      {speaker.email && (
                        <a
                          href={`mailto:${speaker.email}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {speaker.linkedinUrl && (
                        <a
                          href={speaker.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {speaker.twitterUrl && (
                        <a
                          href={speaker.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {speaker.websiteUrl && (
                        <a
                          href={speaker.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t pt-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/speakers/${speaker.id}/edit`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                  <form action={removeSpeakerAction.bind(null, speaker.id)}>
                    <Button variant="ghost" size="sm" type="submit">
                      <Trash2 className="mr-1 h-3 w-3 text-destructive" />
                      Remove
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
