'use client'

import { useBuilder } from '@/contexts/builder-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, FileText, Image } from 'lucide-react'

export function OverviewStep() {
  const { state, updateOverview } = useBuilder()
  const { overview } = state

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <FileText className="h-5 w-5 text-primary" />
          Shop Overview
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up the core details customers see first.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Shop Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Shop Name</Label>
          <Input
            id="name"
            value={overview.name}
            onChange={(e) => updateOverview({ name: e.target.value })}
            placeholder="Lisa's Home Bakery"
            className="text-lg font-semibold"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={overview.tagline}
            onChange={(e) => updateOverview({ tagline: e.target.value })}
            placeholder="Small-batch bakes for weekly porch pickup"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={overview.description}
            onChange={(e) => updateOverview({ description: e.target.value })}
            placeholder="Tell customers what you make, when you bake, and how pickup works..."
            rows={3}
          />
        </div>

        {/* Order Window */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Order Window Opens
            </Label>
            <Input
              id="startDate"
              type="date"
              value={overview.startDate}
              onChange={(e) => updateOverview({ startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Order Window Closes
            </Label>
            <Input
              id="endDate"
              type="date"
              value={overview.endDate}
              onChange={(e) => updateOverview({ endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Pickup */}
        <div className="space-y-2">
          <Label htmlFor="venueName" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Pickup Location Name
          </Label>
          <Input
            id="venueName"
            value={overview.venueName}
            onChange={(e) => updateOverview({ venueName: e.target.value })}
            placeholder="Front Porch Pickup"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueAddress">Pickup Address</Label>
          <Input
            id="venueAddress"
            value={overview.venueAddress}
            onChange={(e) => updateOverview({ venueAddress: e.target.value })}
            placeholder="123 Maple St, Hometown, ST 12345"
          />
        </div>

        {/* Logo & Banner Upload Placeholders */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Logo
            </Label>
            <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-muted-foreground">
              Drag and drop or click to upload
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Hero Image
            </Label>
            <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-muted-foreground">
              Drag and drop or click to upload
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
