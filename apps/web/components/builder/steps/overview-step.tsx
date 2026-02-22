'use client'

import { useRef, useState } from 'react'
import { useBuilder } from '@/contexts/builder-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, FileText, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react'

function ImageUpload({
  label,
  value,
  onChange,
  aspectHint,
}: {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  aspectHint: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setIsProcessing(true)

    // Resize to reasonable dimensions for storage
    const maxSize = label === 'Logo' ? 256 : 1200
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new window.Image()

    img.onload = () => {
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      onChange(dataUrl)
      setIsProcessing(false)
    }
    img.onerror = () => setIsProcessing(false)
    img.src = URL.createObjectURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        {label}
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-lg border">
          <img src={value} alt={label} className="h-24 w-full object-cover" />
          <div className="absolute right-1 top-1 flex gap-1">
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
              title="Change image"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onChange(null)}
              className="rounded-full bg-black/60 p-1 text-white transition hover:bg-red-600"
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Click or drop to upload</span>
              <span className="text-[10px] text-slate-400">{aspectHint}</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

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

        {/* Logo & Banner Upload */}
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUpload
            label="Logo"
            value={overview.logoUrl}
            onChange={(url) => updateOverview({ logoUrl: url })}
            aspectHint="Square, 256x256 recommended"
          />
          <ImageUpload
            label="Hero Image"
            value={overview.bannerUrl}
            onChange={(url) => updateOverview({ bannerUrl: url })}
            aspectHint="Wide, 1200x400 recommended"
          />
        </div>
      </div>
    </div>
  )
}
