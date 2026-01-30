'use client'

import { useConferenceEditor } from '@/contexts/conference-editor-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, FileText, Image } from 'lucide-react'

export function OverviewStep() {
  const { state, updateConference } = useConferenceEditor()
  const { conference } = state

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <FileText className="h-5 w-5 text-blue-600" />
          Event Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Set up the basic details for your conference.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Event Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Event Name *</Label>
          <Input
            id="name"
            value={conference.name}
            onChange={(e) => updateConference({ name: e.target.value })}
            placeholder="My Awesome Conference"
            className="text-lg font-semibold"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={conference.tagline}
            onChange={(e) => updateConference({ tagline: e.target.value })}
            placeholder="Where Innovation Meets Inspiration"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={conference.description}
            onChange={(e) => updateConference({ description: e.target.value })}
            placeholder="Tell attendees what to expect..."
            rows={3}
          />
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Date *
            </Label>
            <Input
              id="startDate"
              type="date"
              value={conference.startDate}
              onChange={(e) => updateConference({ startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End Date *
            </Label>
            <Input
              id="endDate"
              type="date"
              value={conference.endDate}
              onChange={(e) => updateConference({ endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="venueName" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Venue Name
          </Label>
          <Input
            id="venueName"
            value={conference.venueName}
            onChange={(e) => updateConference({ venueName: e.target.value })}
            placeholder="Moscone Center"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueAddress">Venue Address</Label>
          <Input
            id="venueAddress"
            value={conference.venueAddress}
            onChange={(e) => updateConference({ venueAddress: e.target.value })}
            placeholder="747 Howard St, San Francisco, CA 94103"
          />
        </div>

        {/* Logo & Banner Upload Placeholders */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Logo
            </Label>
            <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-100">
              Drag & drop or click to upload
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Banner Image
            </Label>
            <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-100">
              Drag & drop or click to upload
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
