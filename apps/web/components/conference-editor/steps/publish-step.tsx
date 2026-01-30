'use client'

import { useState } from 'react'
import { useConferenceEditor } from '@/contexts/conference-editor-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Rocket,
  Check,
  Copy,
  ExternalLink,
  QrCode,
  Share2,
  Loader2,
  PartyPopper,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function PublishStep() {
  const { state, publish, isSaving, isPublished } = useConferenceEditor()
  const { conference } = state
  const [copied, setCopied] = useState<'url' | 'code' | null>(null)

  // Generate slug from conference name
  const slug = conference.slug || conference.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const attendeeUrl = `https://conference-os.vercel.app/c/${slug}`
  const eventCode = slug.slice(0, 6).toUpperCase()

  const copyToClipboard = async (text: string, type: 'url' | 'code') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (isPublished) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600">
            <PartyPopper className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Your Conference is Live!
          </h2>
          <p className="mt-2 text-slate-500">
            Share the link below with your attendees
          </p>
        </div>

        <div className="space-y-6">
          {/* Attendee URL */}
          <div className="space-y-3">
            <Label>Attendee App URL</Label>
            <div className="flex gap-2">
              <Input
                value={attendeeUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(attendeeUrl, 'url')}
                className="shrink-0"
              >
                {copied === 'url' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" asChild className="shrink-0">
                <a href={attendeeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Event Code */}
          <div className="space-y-3">
            <Label>Event Code</Label>
            <div className="flex gap-2">
              <Input
                value={eventCode}
                readOnly
                className="font-mono text-2xl font-bold tracking-widest text-center"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(eventCode, 'code')}
                className="shrink-0"
              >
                {copied === 'code' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Attendees can use this code to quickly find your conference in the app.
            </p>
          </div>

          {/* QR Code placeholder */}
          <div className="space-y-3">
            <Label>QR Code</Label>
            <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <QrCode className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">
                  QR Code generation coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600">
          <Rocket className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Ready to Launch?
        </h2>
        <p className="mt-2 text-slate-500">
          Review your conference details and publish when ready
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="font-semibold text-slate-900">Summary</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Event Name</dt>
            <dd className="font-medium text-slate-900">{conference.name || 'Not set'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Dates</dt>
            <dd className="font-medium text-slate-900">
              {conference.startDate} - {conference.endDate}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Venue</dt>
            <dd className="font-medium text-slate-900">{conference.venueName || 'Not set'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Modules</dt>
            <dd className="font-medium text-slate-900">
              {state.modules.filter(m => m.enabled).length} enabled
            </dd>
          </div>
        </dl>
      </div>

      {/* Preview URL */}
      <div className="space-y-3">
        <Label>Your Conference URL</Label>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <code className="text-sm text-blue-600">{attendeeUrl}</code>
        </div>
      </div>

      {/* Publish button */}
      <Button
        onClick={publish}
        disabled={isSaving || !conference.name}
        className="w-full gap-2 bg-gradient-to-r from-blue-600 to-violet-600 py-6 text-lg hover:from-blue-700 hover:to-violet-700"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <Rocket className="h-5 w-5" />
            Publish Conference
          </>
        )}
      </Button>

      <p className="text-center text-xs text-slate-500">
        You can always edit your conference after publishing.
      </p>
    </div>
  )
}
