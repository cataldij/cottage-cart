'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import {
  Bell,
  Send,
  Users,
  Mic,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
} from 'lucide-react'

interface NotificationHistory {
  id: string
  title: string
  message: string
  targetRole: string | null
  sentAt: Date
  recipientCount: number
  status: 'sent' | 'failed' | 'pending'
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

type RoleCounts = {
  all: number
  speaker: number
  sponsor: number
  staff: number
  pushEnabled: number
}

export default function NotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState<string | null>(null)
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [sendPush, setSendPush] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [conferenceId, setConferenceId] = useState<string | null>(null)
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({
    all: 0,
    speaker: 0,
    sponsor: 0,
    staff: 0,
    pushEnabled: 0,
  })
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    const loadConference = async () => {
      const supabase = getSupabaseBrowser()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: conferences } = await supabase
        .from('conferences')
        .select('id')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (conferences && conferences.length > 0) {
        setConferenceId(conferences[0].id)
      }
    }

    loadConference()
  }, [])

  useEffect(() => {
    if (!conferenceId) return

    const loadCounts = async () => {
      const supabase = getSupabaseBrowser()
      const { data: members } = await supabase
        .from('conference_members')
        .select('role, user:profiles(push_enabled)')
        .eq('conference_id', conferenceId)

      const counts = members?.reduce<RoleCounts>(
        (acc, member) => {
          if (member.role === 'speaker') acc.speaker += 1
          if (member.role === 'sponsor') acc.sponsor += 1
          if (member.role === 'staff') acc.staff += 1
          if (member.user?.push_enabled) acc.pushEnabled += 1
          acc.all += 1
          return acc
        },
        { all: 0, speaker: 0, sponsor: 0, staff: 0, pushEnabled: 0 }
      )

      setRoleCounts(counts || { all: 0, speaker: 0, sponsor: 0, staff: 0, pushEnabled: 0 })
    }

    const loadHistory = async () => {
      const supabase = getSupabaseBrowser()
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('conference_id', conferenceId)
        .order('created_at', { ascending: false })

      setAnnouncements(data || [])
    }

    loadCounts()
    loadHistory()
  }, [conferenceId])

  const history: NotificationHistory[] = useMemo(() => {
    return announcements.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      targetRole: item.target_role,
      sentAt: new Date(item.created_at),
      recipientCount: item.target_role
        ? (roleCounts as any)[item.target_role] || 0
        : roleCounts.all,
      status: 'sent' as const,
      priority: (item.priority || 'normal') as NotificationHistory['priority'],
    }))
  }, [announcements, roleCounts])

  const roleOptions = useMemo(
    () => [
      { value: null, label: 'All Attendees', icon: Users, count: roleCounts.all },
      { value: 'speaker', label: 'Speakers Only', icon: Mic, count: roleCounts.speaker },
      { value: 'sponsor', label: 'Sponsors Only', icon: Building2, count: roleCounts.sponsor },
      { value: 'staff', label: 'Staff Only', icon: Users, count: roleCounts.staff },
    ],
    [roleCounts]
  )

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please enter both title and message')
      return
    }
    if (!conferenceId) {
      alert('No conference selected')
      return
    }

    setIsSending(true)
    const supabase = getSupabaseBrowser()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        conference_id: conferenceId,
        title: title.trim(),
        message: message.trim(),
        priority,
        target_role: targetRole,
        send_push: sendPush,
        created_by: user?.id,
      })
      .select()
      .single()

    if (error || !announcement) {
      setIsSending(false)
      alert(error?.message || 'Failed to send notification')
      return
    }

    let status: NotificationHistory['status'] = 'sent'
    if (sendPush) {
      try {
        let userIds: string[] | undefined
        if (targetRole) {
          const { data: members } = await supabase
            .from('conference_members')
            .select('user_id')
            .eq('conference_id', conferenceId)
            .eq('role', targetRole)
          userIds = members?.map((m) => m.user_id) || []
        }

        await supabase.functions.invoke('send-push-notification', {
          body: {
            userIds: userIds && userIds.length > 0 ? userIds : undefined,
            conferenceId: !targetRole ? conferenceId : undefined,
            title: title.trim(),
            body: message.trim(),
            data: {
              priority,
              announcementId: announcement.id,
            },
          },
        })
      } catch (err) {
        status = 'failed'
      }
    }

    const recipientCount = targetRole
      ? (roleCounts as any)[targetRole] || 0
      : roleCounts.all

    setAnnouncements((prev) => [announcement, ...prev])

    setTitle('')
    setMessage('')
    setTargetRole(null)
    setPriority('normal')
    setSendPush(true)
    setIsSending(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Send announcements and push notifications to attendees.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Notification
            </CardTitle>
            <CardDescription>
              Compose an announcement for attendees and staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((option) => (
                  <button
                    key={option.value || 'all'}
                    onClick={() => setTargetRole(option.value)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      targetRole === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{option.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-2">
                {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-red-500 text-white'
                          : p === 'high'
                          ? 'bg-orange-500 text-white'
                          : 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={sendPush}
                onChange={(e) => setSendPush(e.target.checked)}
              />
              Send push notification
            </label>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Keynote starting soon"
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">{title.length}/50 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your notification message..."
                rows={4}
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{message.length}/200 characters</p>
            </div>

            {(title || message) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{title || 'Notification Title'}</p>
                      <p className="text-sm text-muted-foreground">
                        {message || 'Your message will appear here...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={!title.trim() || !message.trim() || isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to{' '}
                  {roleOptions.find((r) => r.value === targetRole)?.count || roleCounts.all}{' '}
                  {targetRole
                    ? roleOptions.find((r) => r.value === targetRole)?.label.toLowerCase()
                    : 'attendees'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>History of sent announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-semibold">No notifications sent</h3>
                <p className="text-sm text-muted-foreground">
                  Your sent notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {notification.status === 'sent' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : notification.status === 'failed' ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {notification.sentAt.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>
                            {notification.targetRole
                              ? `${notification.targetRole}s only`
                              : 'All attendees'}
                          </span>
                          <span>{notification.recipientCount} recipients</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize text-muted-foreground">
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground">announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.reduce((sum, n) => sum + n.recipientCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">messages delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.length > 0
                ? (
                    (history.filter((n) => n.status === 'sent').length / history.length) *
                    100
                  ).toFixed(0)
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground">delivery rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Push Enabled</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roleCounts.all > 0
                ? Math.round((roleCounts.pushEnabled / roleCounts.all) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">of attendees</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
