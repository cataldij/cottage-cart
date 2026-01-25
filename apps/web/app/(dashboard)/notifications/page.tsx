// @ts-nocheck
'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
}

// Mock data - replace with API calls
const mockHistory: NotificationHistory[] = [
  {
    id: '1',
    title: 'Keynote Starting Soon',
    message: 'The opening keynote with Sarah Chen begins in 15 minutes in the Grand Ballroom.',
    targetRole: null,
    sentAt: new Date('2024-06-15T09:45:00'),
    recipientCount: 342,
    status: 'sent',
  },
  {
    id: '2',
    title: 'Schedule Update',
    message: 'The workshop "Advanced AI Techniques" has moved to Room 204.',
    targetRole: null,
    sentAt: new Date('2024-06-15T11:30:00'),
    recipientCount: 342,
    status: 'sent',
  },
  {
    id: '3',
    title: 'Speaker Reminder',
    message: 'Please arrive at your session room 15 minutes early for A/V setup.',
    targetRole: 'speaker',
    sentAt: new Date('2024-06-15T08:00:00'),
    recipientCount: 24,
    status: 'sent',
  },
]

export default function NotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState<string | null>(null)
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [isSending, setIsSending] = useState(false)
  const [history, setHistory] = useState<NotificationHistory[]>(mockHistory)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please enter both title and message')
      return
    }

    setIsSending(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newNotification: NotificationHistory = {
      id: `${Date.now()}`,
      title,
      message,
      targetRole,
      sentAt: new Date(),
      recipientCount: targetRole ? 24 : 342,
      status: 'sent',
    }

    setHistory([newNotification, ...history])
    setTitle('')
    setMessage('')
    setTargetRole(null)
    setPriority('normal')
    setIsSending(false)
  }

  const roleOptions = [
    { value: null, label: 'All Attendees', icon: Users, count: 342 },
    { value: 'speaker', label: 'Speakers Only', icon: Mic, count: 24 },
    { value: 'sponsor', label: 'Sponsors Only', icon: Building2, count: 15 },
    { value: 'staff', label: 'Staff Only', icon: Users, count: 8 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Send push notifications and announcements to attendees
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Compose Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Notification
            </CardTitle>
            <CardDescription>
              Compose and send a push notification to attendees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Target Audience */}
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

            {/* Priority */}
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

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Keynote Starting Soon"
                className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">{title.length}/50 characters</p>
            </div>

            {/* Message */}
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

            {/* Preview */}
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

            {/* Send Button */}
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
                  Send to {roleOptions.find((r) => r.value === targetRole)?.count || 342}{' '}
                  {targetRole ? roleOptions.find((r) => r.value === targetRole)?.label.toLowerCase() : 'attendees'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              History of sent notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-semibold">No notifications sent</h3>
                <p className="text-sm text-muted-foreground">
                  Your sent notifications will appear here
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground">notifications today</p>
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
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">of attendees</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
