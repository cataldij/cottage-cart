'use client'

import { useState, useRef, useCallback } from 'react'
import { useConferenceEditor } from '@/contexts/conference-editor-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import {
  Palette,
  Sparkles,
  Type,
  Loader2,
  Image as ImageIcon,
  Layout,
  Settings2,
  Grid3X3,
  Video,
  Layers,
  Upload,
  X,
  Link,
} from 'lucide-react'

const COLOR_PRESETS = [
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#6366f1', accent: '#f59e0b' },
  { name: 'Forest', primary: '#22c55e', secondary: '#14b8a6', accent: '#eab308' },
  { name: 'Sunset', primary: '#f97316', secondary: '#ef4444', accent: '#8b5cf6' },
  { name: 'Royal', primary: '#8b5cf6', secondary: '#ec4899', accent: '#06b6d4' },
  { name: 'Midnight', primary: '#1e293b', secondary: '#475569', accent: '#3b82f6' },
  { name: 'Corporate', primary: '#2563eb', secondary: '#7c3aed', accent: '#10b981' },
]

// Comprehensive font list organized by category
const FONT_OPTIONS = [
  // Modern Sans-Serif - Clean & Contemporary
  { value: 'Inter', label: 'Inter', category: 'Modern Sans' },
  { value: 'Poppins', label: 'Poppins', category: 'Modern Sans' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Modern Sans' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Modern Sans' },
  { value: 'Manrope', label: 'Manrope', category: 'Modern Sans' },
  { value: 'Outfit', label: 'Outfit', category: 'Modern Sans' },
  { value: 'Figtree', label: 'Figtree', category: 'Modern Sans' },
  { value: 'Albert Sans', label: 'Albert Sans', category: 'Modern Sans' },

  // Classic Sans-Serif - Timeless & Professional
  { value: 'Roboto', label: 'Roboto', category: 'Classic Sans' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Classic Sans' },
  { value: 'Lato', label: 'Lato', category: 'Classic Sans' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Classic Sans' },
  { value: 'Raleway', label: 'Raleway', category: 'Classic Sans' },
  { value: 'Nunito', label: 'Nunito', category: 'Classic Sans' },
  { value: 'Source Sans 3', label: 'Source Sans 3', category: 'Classic Sans' },
  { value: 'Work Sans', label: 'Work Sans', category: 'Classic Sans' },
  { value: 'Rubik', label: 'Rubik', category: 'Classic Sans' },
  { value: 'Quicksand', label: 'Quicksand', category: 'Classic Sans' },
  { value: 'Karla', label: 'Karla', category: 'Classic Sans' },

  // Display & Bold - Headlines & Impact
  { value: 'Sora', label: 'Sora', category: 'Display' },
  { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Display' },
  { value: 'Lexend', label: 'Lexend', category: 'Display' },
  { value: 'Urbanist', label: 'Urbanist', category: 'Display' },
  { value: 'Red Hat Display', label: 'Red Hat Display', category: 'Display' },
  { value: 'Bebas Neue', label: 'Bebas Neue', category: 'Display' },
  { value: 'Oswald', label: 'Oswald', category: 'Display' },
  { value: 'Anton', label: 'Anton', category: 'Display' },
  { value: 'Archivo', label: 'Archivo', category: 'Display' },

  // Elegant Serif - Sophisticated & Editorial
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Lora', label: 'Lora', category: 'Serif' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', category: 'Serif' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'Serif' },
  { value: 'Crimson Pro', label: 'Crimson Pro', category: 'Serif' },
  { value: 'Source Serif 4', label: 'Source Serif 4', category: 'Serif' },
  { value: 'DM Serif Display', label: 'DM Serif Display', category: 'Serif' },

  // Monospace - Technical & Code
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
  { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
  { value: 'Source Code Pro', label: 'Source Code Pro', category: 'Monospace' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono', category: 'Monospace' },
]

const BACKGROUND_PATTERNS = [
  { value: 'none', label: 'None' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'zigzag', label: 'Zigzag' },
]

const HERO_HEIGHTS = [
  { value: 'small', label: 'Small', desc: '200px' },
  { value: 'medium', label: 'Medium', desc: '320px' },
  { value: 'large', label: 'Large', desc: '480px' },
  { value: 'full', label: 'Full Screen', desc: '100vh' },
]

const HERO_STYLES = [
  { value: 'gradient', label: 'Gradient', icon: Layers },
  { value: 'image', label: 'Image', icon: ImageIcon },
  { value: 'video', label: 'Video', icon: Video },
]

// Media Upload Component with drag-and-drop
interface MediaUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  accept: string
  label: string
  placeholder: string
}

function MediaUpload({ value, onChange, accept, label, placeholder }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      // Convert to base64 for immediate preview
      // In production, you'd upload to Supabase Storage or similar
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange(reader.result as string)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setIsUploading(false)
        alert('Failed to read file')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setIsUploading(false)
      alert('Failed to upload file')
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleUrlSubmit = useCallback(() => {
    if (urlValue.trim()) {
      onChange(urlValue.trim())
      setShowUrlInput(false)
      setUrlValue('')
    }
  }, [urlValue, onChange])

  const handleRemove = useCallback(() => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [onChange])

  if (value) {
    // Preview mode
    const isVideo = accept.includes('video') || value.includes('video') || value.endsWith('.mp4') || value.endsWith('.webm')
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          {isVideo ? (
            <video
              src={value}
              className="w-full h-40 object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500 truncate">{value.startsWith('data:') ? 'Uploaded file' : value}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {showUrlInput ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button size="sm" onClick={handleUrlSubmit}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowUrlInput(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all
            ${isDragging
              ? 'border-violet-500 bg-violet-50'
              : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50/50'
            }
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
          ) : (
            <Upload className={`h-8 w-8 ${isDragging ? 'text-violet-500' : 'text-slate-400'}`} />
          )}
          <div className="text-center">
            <p className={`text-sm font-medium ${isDragging ? 'text-violet-600' : 'text-slate-600'}`}>
              {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {accept.includes('video') ? 'MP4, WebM up to 50MB' : 'PNG, JPG, WebP up to 10MB'}
            </p>
          </div>
        </div>
      )}

      {!showUrlInput && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowUrlInput(true) }}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors"
        >
          <Link className="h-3 w-3" />
          Or enter a URL instead
        </button>
      )}
    </div>
  )
}

export function BrandingStep() {
  const { state, updateConference } = useConferenceEditor()
  const { conference } = state
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)

    try {
      const preset = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]
      await new Promise(resolve => setTimeout(resolve, 1500))
      updateConference({
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
        accentColor: preset.accent,
        buttonColor: preset.primary,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const ColorPicker = ({ label, field, value }: { label: string; field: string; value: string }) => (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-lg border border-slate-200 shadow-sm cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <Input
          type="color"
          value={value}
          onChange={(e) => updateConference({ [field]: e.target.value })}
          className="h-8 w-16 cursor-pointer p-0 border-0"
        />
        <Input
          value={value}
          onChange={(e) => updateConference({ [field]: e.target.value })}
          className="h-8 font-mono text-xs flex-1"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Palette className="h-5 w-5 text-violet-600" />
          Branding & Design
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Customize every aspect of your conference appearance.
        </p>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="colors" className="gap-1.5 text-xs py-2 flex-col h-auto">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-1.5 text-xs py-2 flex-col h-auto">
            <Type className="h-4 w-4" />
            Fonts
          </TabsTrigger>
          <TabsTrigger value="hero" className="gap-1.5 text-xs py-2 flex-col h-auto">
            <Layout className="h-4 w-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="background" className="gap-1.5 text-xs py-2 flex-col h-auto">
            <Grid3X3 className="h-4 w-4" />
            Background
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-1.5 text-xs py-2 flex-col h-auto">
            <Settings2 className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="mt-6 space-y-6">
          {/* Quick Presets */}
          <div className="space-y-3">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateConference({
                    primaryColor: preset.primary,
                    secondaryColor: preset.secondary,
                    accentColor: preset.accent,
                    buttonColor: preset.primary,
                  })}
                  className="group flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 p-2 transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex gap-0.5">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Brand Colors</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorPicker label="Primary" field="primaryColor" value={conference.primaryColor} />
              <ColorPicker label="Secondary" field="secondaryColor" value={conference.secondaryColor} />
              <ColorPicker label="Accent" field="accentColor" value={conference.accentColor} />
            </div>
          </div>

          {/* UI Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">UI Colors</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorPicker label="Background" field="backgroundColor" value={conference.backgroundColor} />
              <ColorPicker label="Text" field="textColor" value={conference.textColor} />
              <ColorPicker label="Headings" field="headingColor" value={conference.headingColor} />
            </div>
          </div>

          {/* Navigation Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Navigation</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorPicker label="Nav Background" field="navBackgroundColor" value={conference.navBackgroundColor} />
              <ColorPicker label="Nav Text" field="navTextColor" value={conference.navTextColor} />
            </div>
          </div>

          {/* Button Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Buttons</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorPicker label="Button Background" field="buttonColor" value={conference.buttonColor} />
              <ColorPicker label="Button Text" field="buttonTextColor" value={conference.buttonTextColor} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Registration Button Text</Label>
              <Input
                value={conference.registrationButtonText}
                onChange={(e) => updateConference({ registrationButtonText: e.target.value })}
                placeholder="Register Now"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label>Preview</Label>
            <div
              className="rounded-xl p-6"
              style={{ background: `linear-gradient(135deg, ${conference.primaryColor}, ${conference.secondaryColor})` }}
            >
              <div className="text-white text-lg font-bold">{conference.name || 'Conference Name'}</div>
              <div className="text-white/80 text-sm mt-1">{conference.tagline || 'Your tagline here'}</div>
              <button
                className="mt-4 px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: conference.buttonColor, color: conference.buttonTextColor }}
              >
                {conference.registrationButtonText || 'Register Now'}
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label>Heading Font</Label>
              <select
                value={conference.fontHeading}
                onChange={(e) => updateConference({ fontHeading: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <Label>Body Font</Label>
              <select
                value={conference.fontBody}
                onChange={(e) => updateConference({ fontBody: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Typography Preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div
              className="text-3xl font-bold"
              style={{ fontFamily: `"${conference.fontHeading}", sans-serif`, color: conference.headingColor }}
            >
              {conference.name || 'Conference Name'}
            </div>
            <div
              className="text-xl"
              style={{ fontFamily: `"${conference.fontHeading}", sans-serif`, color: conference.headingColor }}
            >
              Section Heading
            </div>
            <div
              className="text-base"
              style={{ fontFamily: `"${conference.fontBody}", sans-serif`, color: conference.textColor }}
            >
              Body text will appear like this throughout your conference website and app.
              This is how attendees will read session descriptions, speaker bios, and other content.
            </div>
            <div
              className="text-sm"
              style={{ fontFamily: `"${conference.fontBody}", sans-serif`, color: conference.textColor, opacity: 0.7 }}
            >
              Smaller text for captions and metadata.
            </div>
          </div>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero" className="mt-6 space-y-6">
          {/* Hero Style */}
          <div className="space-y-3">
            <Label>Hero Style</Label>
            <div className="grid grid-cols-3 gap-3">
              {HERO_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateConference({ heroStyle: style.value as any })}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    conference.heroStyle === style.value
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <style.icon className={`h-6 w-6 ${conference.heroStyle === style.value ? 'text-violet-600' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${conference.heroStyle === style.value ? 'text-violet-600' : 'text-slate-600'}`}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Height */}
          <div className="space-y-3">
            <Label>Hero Height</Label>
            <div className="grid grid-cols-4 gap-2">
              {HERO_HEIGHTS.map((height) => (
                <button
                  key={height.value}
                  onClick={() => updateConference({ heroHeight: height.value as any })}
                  className={`rounded-lg border-2 p-3 text-center transition-all ${
                    conference.heroHeight === height.value
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`text-sm font-medium ${conference.heroHeight === height.value ? 'text-violet-600' : 'text-slate-700'}`}>
                    {height.label}
                  </div>
                  <div className="text-xs text-slate-500">{height.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Image/Video Upload */}
          {conference.heroStyle === 'image' && (
            <MediaUpload
              value={conference.heroBackgroundUrl}
              onChange={(url) => updateConference({ heroBackgroundUrl: url })}
              accept="image/*"
              label="Hero Image"
              placeholder="https://example.com/hero-image.jpg"
            />
          )}

          {conference.heroStyle === 'video' && (
            <MediaUpload
              value={conference.heroVideoUrl}
              onChange={(url) => updateConference({ heroVideoUrl: url })}
              accept="video/*"
              label="Hero Video"
              placeholder="https://example.com/hero-video.mp4"
            />
          )}

          {/* Overlay Opacity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Overlay Opacity</Label>
              <span className="text-sm text-slate-500">{Math.round(conference.heroOverlayOpacity * 100)}%</span>
            </div>
            <Slider
              value={[conference.heroOverlayOpacity]}
              onValueChange={([value]) => updateConference({ heroOverlayOpacity: value })}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Hero Preview */}
          <div className="space-y-3">
            <Label>Preview</Label>
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                height: conference.heroHeight === 'small' ? 100 : conference.heroHeight === 'large' ? 200 : 150,
                background: `linear-gradient(135deg, ${conference.primaryColor}, ${conference.secondaryColor})`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(0,0,0,${conference.heroOverlayOpacity})` }}
              />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-lg font-bold">{conference.name || 'Conference Name'}</div>
                <div className="text-sm opacity-80">{conference.tagline || 'Your tagline'}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Background Tab */}
        <TabsContent value="background" className="mt-6 space-y-6">
          {/* Background Pattern */}
          <div className="space-y-3">
            <Label>Background Pattern</Label>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUND_PATTERNS.map((pattern) => (
                <button
                  key={pattern.value}
                  onClick={() => updateConference({ backgroundPattern: pattern.value as any })}
                  className={`rounded-lg border-2 p-3 text-center transition-all ${
                    conference.backgroundPattern === pattern.value
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-sm font-medium ${conference.backgroundPattern === pattern.value ? 'text-violet-600' : 'text-slate-600'}`}>
                    {pattern.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {conference.backgroundPattern !== 'none' && (
            <ColorPicker
              label="Pattern Color"
              field="backgroundPatternColor"
              value={conference.backgroundPatternColor}
            />
          )}

          {/* Background Gradient */}
          <div className="space-y-3">
            <Label>Background Gradient (optional)</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Start Color</Label>
                <Input
                  type="color"
                  value={conference.backgroundGradientStart || '#ffffff'}
                  onChange={(e) => updateConference({ backgroundGradientStart: e.target.value })}
                  className="h-10 w-full cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">End Color</Label>
                <Input
                  type="color"
                  value={conference.backgroundGradientEnd || '#f8fafc'}
                  onChange={(e) => updateConference({ backgroundGradientEnd: e.target.value })}
                  className="h-10 w-full cursor-pointer"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateConference({ backgroundGradientStart: '', backgroundGradientEnd: '' })}
            >
              Clear Gradient
            </Button>
          </div>

          {/* Background Image */}
          <MediaUpload
            value={conference.backgroundImageUrl}
            onChange={(url) => updateConference({ backgroundImageUrl: url })}
            accept="image/*"
            label="Background Image"
            placeholder="https://example.com/background.jpg"
          />

          {conference.backgroundImageUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Image Overlay</Label>
                <span className="text-sm text-slate-500">{Math.round(conference.backgroundImageOverlay * 100)}%</span>
              </div>
              <Slider
                value={[conference.backgroundImageOverlay]}
                onValueChange={([value]) => updateConference({ backgroundImageOverlay: value })}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>
          )}
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="mt-6 space-y-6">
          {/* Footer */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Footer</Label>
            <div className="space-y-2">
              <Label className="text-xs">Custom Footer Text</Label>
              <Input
                value={conference.footerText}
                onChange={(e) => updateConference({ footerText: e.target.value })}
                placeholder="© 2024 Your Conference. All rights reserved."
              />
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Legal Links</Label>
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Privacy Policy URL</Label>
                <Input
                  value={conference.privacyPolicyUrl}
                  onChange={(e) => updateConference({ privacyPolicyUrl: e.target.value })}
                  placeholder="https://example.com/privacy"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Terms of Service URL</Label>
                <Input
                  value={conference.termsUrl}
                  onChange={(e) => updateConference({ termsUrl: e.target.value })}
                  placeholder="https://example.com/terms"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Code of Conduct URL</Label>
                <Input
                  value={conference.codeOfConductUrl}
                  onChange={(e) => updateConference({ codeOfConductUrl: e.target.value })}
                  placeholder="https://example.com/code-of-conduct"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Social Links</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Twitter/X URL</Label>
                <Input
                  value={conference.twitterUrl}
                  onChange={(e) => updateConference({ twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/yourconf"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">LinkedIn URL</Label>
                <Input
                  value={conference.linkedinUrl}
                  onChange={(e) => updateConference({ linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/yourconf"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Instagram URL</Label>
                <Input
                  value={conference.instagramUrl}
                  onChange={(e) => updateConference({ instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/yourconf"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">YouTube URL</Label>
                <Input
                  value={conference.youtubeUrl}
                  onChange={(e) => updateConference({ youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/@yourconf"
                />
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Custom CSS</Label>
            <p className="text-xs text-slate-500">
              Add custom CSS to further customize your conference pages. Use with caution.
            </p>
            <textarea
              value={conference.customCss}
              onChange={(e) => updateConference({ customCss: e.target.value })}
              placeholder={`.conference-hero {\n  /* Your custom styles */\n}`}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
