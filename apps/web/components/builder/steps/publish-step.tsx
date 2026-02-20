'use client'

import { useBuilder } from '@/contexts/builder-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Rocket,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Share2,
  Download,
  PartyPopper,
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export function PublishStep() {
  const { state, generateEventCode } = useBuilder()
  const { publish, overview } = state
  const [copied, setCopied] = useState(false)

  const formatDate = (value?: string) => {
    if (!value) return 'TBD'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return 'TBD'
    return parsed.toLocaleDateString()
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!publish.isPublished) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Rocket className="h-5 w-5 text-primary" />
            Ready to Publish
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your setup and publish your storefront preview.
          </p>
        </div>

        {/* Summary */}
        <div className="space-y-4 rounded-2xl border bg-gradient-to-br from-slate-50 to-white p-6">
          <h3 className="font-semibold">Shop Summary</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shop Name</span>
              <span className="font-medium">{overview.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Window</span>
              <span className="font-medium">
                {formatDate(overview.startDate)} - {formatDate(overview.endDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup Location</span>
              <span className="font-medium">{overview.venueName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Tabs</span>
              <span className="font-medium">
                {state.navigation.filter(m => m.enabled).length} tabs
              </span>
            </div>
          </div>
        </div>

        {/* Publish Button */}
        <Button
          size="lg"
          className="w-full gap-2 bg-green-600 hover:bg-green-700"
          onClick={generateEventCode}
        >
          <Rocket className="h-5 w-5" />
          Publish Storefront
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          In demo mode, this generates a preview link. Sign up to publish your live maker shop.
        </p>
      </div>
    )
  }

  // Published State
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <PartyPopper className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Your Storefront is Live!</h2>
        <p className="mt-1 text-muted-foreground">
          Share the link or QR code with your customers.
        </p>
      </div>

      {/* Shop Code */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-6 text-center">
        <p className="text-sm text-muted-foreground">Shop Code</p>
        <p className="mt-2 font-mono text-4xl font-bold tracking-widest text-primary">
          {publish.eventCode}
        </p>
      </div>

      {/* QR Code Placeholder */}
      <div className="flex flex-col items-center rounded-2xl border bg-white p-6">
        <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed bg-slate-50">
          <QrCode className="h-20 w-20 text-slate-300" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Scan to open the storefront
        </p>
        <Button variant="outline" size="sm" className="mt-3 gap-2">
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>
      </div>

      {/* Storefront URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Storefront URL</label>
        <div className="flex gap-2">
          <Input
            value={publish.attendeeUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleCopy(publish.attendeeUrl)}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={publish.attendeeUrl} target="_blank">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Share Options */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="gap-2">
          <Smartphone className="h-4 w-4" />
          Send via SMS
        </Button>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Link
        </Button>
      </div>

      {/* Demo Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
        <p className="text-sm text-amber-800">
          <strong>Demo Mode:</strong> This is a preview. Sign up to publish real storefronts.
        </p>
        <Button asChild className="mt-3" size="sm">
          <Link href="/register">Get Started Free</Link>
        </Button>
      </div>
    </div>
  )
}
