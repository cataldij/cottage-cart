// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
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
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Search,
  Users,
  UserCheck,
  Clock,
  RefreshCw,
} from 'lucide-react'

interface CheckInResult {
  success: boolean
  attendee?: {
    id: string
    name: string
    email: string
    ticketType: string
    role: string
    avatarUrl?: string
  }
  error?: string
  timestamp: Date
}

export default function CheckInPage() {
  const [mode, setMode] = useState<'scanner' | 'manual'>('scanner')
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([])
  const [conferenceId, setConferenceId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    today: 0,
  })

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
    const loadStats = async () => {
      const supabase = getSupabaseBrowser()
      const { data: members } = await supabase
        .from('conference_members')
        .select('checked_in, checked_in_at')
        .eq('conference_id', conferenceId)

      const total = members?.length || 0
      const checkedIn = members?.filter((m) => m.checked_in).length || 0
      const today = members?.filter((m) => {
        if (!m.checked_in_at) return false
        const date = new Date(m.checked_in_at)
        const now = new Date()
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
        )
      }).length || 0

      setStats({ total, checkedIn, today })
    }

    const loadRecent = async () => {
      const supabase = getSupabaseBrowser()
      const { data } = await supabase
        .from('conference_members')
        .select(
          'id, ticket_type, role, checked_in_at, user:profiles(full_name, email, avatar_url)'
        )
        .eq('conference_id', conferenceId)
        .eq('checked_in', true)
        .order('checked_in_at', { ascending: false })
        .limit(10)

      const items =
        data?.map((row) => ({
          success: true,
          attendee: {
            id: row.id,
            name: row.user?.full_name || 'Attendee',
            email: row.user?.email || '',
            ticketType: row.ticket_type || 'general',
            role: row.role,
            avatarUrl: row.user?.avatar_url || undefined,
          },
          timestamp: row.checked_in_at ? new Date(row.checked_in_at) : new Date(),
        })) || []

      setRecentCheckIns(items)
    }

    loadStats()
    loadRecent()
  }, [conferenceId])

  const handleScanResult = async (code: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    if (!conferenceId) {
      setLastResult({
        success: false,
        error: 'No conference selected.',
        timestamp: new Date(),
      })
      setIsProcessing(false)
      return
    }

    const supabase = getSupabaseBrowser()
    const { data, error } = await supabase
      .from('conference_members')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq('conference_id', conferenceId)
      .eq('ticket_code', code)
      .eq('checked_in', false)
      .select(
        'id, ticket_type, role, checked_in_at, user:profiles(full_name, email, avatar_url)'
      )
      .single()

    if (error || !data) {
      setLastResult({
        success: false,
        error: error?.message || 'Invalid ticket code or already checked in',
        timestamp: new Date(),
      })
      setIsProcessing(false)
      setManualCode('')
      return
    }

    const result: CheckInResult = {
      success: true,
      attendee: {
        id: data.id,
        name: data.user?.full_name || 'Attendee',
        email: data.user?.email || '',
        ticketType: data.ticket_type || 'general',
        role: data.role,
        avatarUrl: data.user?.avatar_url || undefined,
      },
      timestamp: data.checked_in_at ? new Date(data.checked_in_at) : new Date(),
    }

    setLastResult(result)
    setRecentCheckIns((prev) => [result, ...prev].slice(0, 10))
    setStats((prev) => ({
      ...prev,
      checkedIn: prev.checkedIn + 1,
      today: prev.today + 1,
    }))

    setIsProcessing(false)
    setManualCode('')

    // Auto-clear result after 3 seconds
    setTimeout(() => setLastResult(null), 3000)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      handleScanResult(manualCode.trim())
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-In</h1>
          <p className="text-muted-foreground">
            Scan attendee badges to check them in
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${((stats.checkedIn / stats.total) * 100).toFixed(1)}%`
                : '0%'}{' '}
              of registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">check-ins today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Scanner Section */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Check-In Scanner
            </CardTitle>
            <CardDescription>
              Scan attendee QR codes or enter ticket codes manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Tabs */}
            <div className="flex gap-2">
              <Button
                variant={mode === 'scanner' ? 'default' : 'outline'}
                onClick={() => setMode('scanner')}
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Scanner
              </Button>
              <Button
                variant={mode === 'manual' ? 'default' : 'outline'}
                onClick={() => setMode('manual')}
                className="flex-1"
              >
                <Search className="mr-2 h-4 w-4" />
                Manual Entry
              </Button>
            </div>

            {/* Scanner View */}
            {mode === 'scanner' ? (
              <div className="space-y-4">
                <div className="relative aspect-square max-w-sm mx-auto rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {/* Placeholder for camera view */}
                  <div className="text-center p-8">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Camera scanner placeholder
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      In production, integrate a QR scanning library like
                      @yudiel/react-qr-scanner
                    </p>
                  </div>

                  {/* Scanner overlay */}
                  <div className="absolute inset-8 border-2 border-dashed border-primary/50 rounded-lg" />
                </div>

                {/* Demo button */}
                <Button
                  className="w-full"
                  onClick={() => handleScanResult(`TICKET-${Date.now()}`)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Simulate Scan (Demo)'
                  )}
                </Button>
              </div>
            ) : (
              /* Manual Entry */
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="ticketCode" className="text-sm font-medium">
                    Ticket Code
                  </label>
                  <input
                    id="ticketCode"
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="Enter ticket code (e.g., TICKET-ABC123)"
                    className="mt-1 w-full rounded-md border border-input bg-background px-4 py-3 text-lg font-mono tracking-wider ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!manualCode.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Check In
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Result Display */}
            {lastResult && (
              <div
                className={`rounded-lg p-4 ${
                  lastResult.success
                    ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {lastResult.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    {lastResult.success && lastResult.attendee ? (
                      <>
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          Check-in Successful!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {lastResult.attendee.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {lastResult.attendee.email} - {lastResult.attendee.ticketType}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-red-800 dark:text-red-200">
                          Check-in Failed
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {lastResult.error}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Check-ins
            </CardTitle>
            <CardDescription>
              Last 10 successful check-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCheckIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserCheck className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-semibold">No check-ins yet</h3>
                <p className="text-sm text-muted-foreground">
                  Scan a badge to see check-ins here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{checkIn.attendee?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {checkIn.attendee?.ticketType} -{' '}
                        {checkIn.timestamp.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Check-in Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in Progress</CardTitle>
          <CardDescription>
            {stats.checkedIn} of {stats.total} attendees checked in (
            {stats.total > 0
              ? `${((stats.checkedIn / stats.total) * 100).toFixed(1)}%`
              : '0%'}
            )
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${
                  stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0
                }%`,
              }}
            />
          </div>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>0</span>
            <span>{Math.round(stats.total / 2)}</span>
            <span>{stats.total}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
