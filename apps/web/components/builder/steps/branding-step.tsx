'use client'

import { useState, useEffect } from 'react'
import { useBuilder } from '@/contexts/builder-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackgroundPicker } from '@/components/conference/background-picker'
import {
  Palette,
  Type,
  Sparkles,
  Wand2,
  Loader2,
  Moon,
  Sun,
  Zap,
  Sliders,
  Users,
  Image,
  ChevronDown,
} from 'lucide-react'

const EXAMPLE_PROMPTS = [
  { label: 'Hearth Bakery', prompt: 'Warm handcrafted bakery brand with parchment tones, deep sage, and classic serif headers.' },
  { label: 'Small Batch Jams', prompt: 'Rustic preserves shop with orchard greens, berry accents, and soft cream backgrounds.' },
  { label: 'Modern Cottage Foods', prompt: 'Clean farmhouse aesthetic, professional and friendly, with natural colors and gentle contrasts.' },
  { label: 'Farmstand Premium', prompt: 'Elevated local food brand, refined typography, earthy neutrals, and elegant hero imagery.' },
]

const REFINEMENTS = [
  { id: 'darker', label: 'Darker', icon: Moon },
  { id: 'lighter', label: 'Lighter', icon: Sun },
  { id: 'bold', label: 'Bolder', icon: Zap },
  { id: 'minimal', label: 'Minimal', icon: Sliders },
  { id: 'playful', label: 'Playful', icon: Sparkles },
  { id: 'professional', label: 'Professional', icon: Users },
]

// Font options (subset)
const FONTS = [
  'Inter', 'Poppins', 'Space Grotesk', 'DM Sans', 'Outfit',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Raleway',
  'Playfair Display', 'Merriweather', 'Bebas Neue', 'Oswald',
]

function AdvancedControls() {
  const { state, updateDesignTokens } = useBuilder()
  const [isOpen, setIsOpen] = useState(false)
  const { design } = state
  const advanced = (design.tokens as any).advanced || {}

  const updateAdvanced = (key: string, value: string) => {
    updateDesignTokens({
      ...design.tokens,
      advanced: { ...advanced, [key]: value },
    } as any)
  }

  return (
    <div className="rounded-xl border bg-white/70">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4"
      >
        <div>
          <h3 className="text-sm font-semibold">Advanced Storefront</h3>
          <p className="text-xs text-muted-foreground">Button style, spacing, and more</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="space-y-4 border-t px-4 pb-4 pt-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Button Shape</label>
              <div className="flex gap-1.5">
                {(['rounded', 'pill', 'square'] as const).map(shape => (
                  <button
                    key={shape}
                    onClick={() => updateAdvanced('buttonShape', shape)}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                      (advanced.buttonShape || 'rounded') === shape
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Button Size</label>
              <div className="flex gap-1.5">
                {(['sm', 'md', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => updateAdvanced('buttonSize', size)}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium uppercase transition-colors ${
                      (advanced.buttonSize || 'md') === size
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Section Spacing</label>
              <div className="flex gap-1.5">
                {(['compact', 'normal', 'spacious'] as const).map(spacing => (
                  <button
                    key={spacing}
                    onClick={() => updateAdvanced('sectionSpacing', spacing)}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                      (advanced.sectionSpacing || 'normal') === spacing
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Product Card Style</label>
              <select
                value={advanced.productCardStyle || 'default'}
                onChange={e => updateAdvanced('productCardStyle', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="default">Default (row)</option>
                <option value="grid">Grid Cards</option>
                <option value="compact">Compact List</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Corner Radius</label>
              <select
                value={advanced.cornerRadius || 'rounded'}
                onChange={e => updateAdvanced('cornerRadius', e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="none">Sharp (0px)</option>
                <option value="subtle">Subtle (8px)</option>
                <option value="rounded">Rounded (16px)</option>
                <option value="pill">Extra Round (28px)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function BrandingStep() {
  const { state, updateDesignTokens, updateGradients, updateCardStyle, updateIconTheme, updateWebSettings, updateAppSettings } = useBuilder()
  const { design, overview, web, app } = state

  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('ai')

  // Dynamic font loading
  useEffect(() => {
    const fonts = design.tokens.typography?.fontFamily
    if (!fonts) return

    const fontFamilies = [fonts.heading, fonts.body].filter(Boolean)
    const uniqueFonts = [...new Set(fontFamilies)]

    document.querySelectorAll('link[data-dynamic-font]').forEach(el => el.remove())

    uniqueFonts.forEach(font => {
      const fontName = font.replace(/ /g, '+')
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`
      link.rel = 'stylesheet'
      link.setAttribute('data-dynamic-font', font)
      document.head.appendChild(link)
    })
  }, [design.tokens.typography?.fontFamily])

  const handleGenerate = async (promptText: string, refinement?: string) => {
    setIsGenerating(true)
    try {
      const fullPrompt = refinement
        ? `${promptText}. Make it ${refinement}.`
        : promptText

      const response = await fetch('/api/ai/design-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()

      if (data.tokens) {
        updateDesignTokens(data.tokens)
      }
      if (data.gradients) {
        updateGradients(data.gradients)
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateColor = (key: string, value: string) => {
    updateDesignTokens({
      ...design.tokens,
      colors: { ...design.tokens.colors, [key]: value },
    })
  }

  const updateFont = (type: 'heading' | 'body', value: string) => {
    updateDesignTokens({
      ...design.tokens,
      typography: {
        ...design.tokens.typography,
        fontFamily: { ...design.tokens.typography.fontFamily, [type]: value },
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Palette className="h-5 w-5 text-primary" />
          Branding & Design
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a warm, trustworthy storefront look that still feels professional.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="ai" className="flex-1 gap-1.5">
            <Sparkles className="h-4 w-4" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex-1 gap-1.5">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex-1 gap-1.5">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="background" className="flex-1 gap-1.5">
            <Image className="h-4 w-4" />
            Background
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4 space-y-4">
          {/* Gradient Preview */}
          {design.gradients && (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="h-10 rounded-lg" style={{ background: design.gradients.hero }} />
                <p className="text-center text-xs text-muted-foreground">Hero</p>
              </div>
              <div className="space-y-1">
                <div className="h-10 rounded-lg" style={{ background: design.gradients.accent }} />
                <p className="text-center text-xs text-muted-foreground">Accent</p>
              </div>
              <div className="space-y-1">
                <div className="h-10 rounded-lg border" style={{ background: design.gradients.card }} />
                <p className="text-center text-xs text-muted-foreground">Card</p>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your shop style (example: cozy sourdough bakery, heirloom branding, warm cream + sage palette)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button
              className="w-full gap-2"
              onClick={() => handleGenerate(prompt)}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generate Design
            </Button>
          </div>

          {/* Quick Refinements */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Refinements</label>
            <div className="grid grid-cols-3 gap-2">
              {REFINEMENTS.map((ref) => (
                <Button
                  key={ref.id}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleGenerate(prompt || 'Current design', ref.id)}
                  disabled={isGenerating}
                >
                  <ref.icon className="h-3 w-3" />
                  {ref.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Try an Example</label>
            <div className="grid grid-cols-2 gap-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example.label}
                  onClick={() => {
                    setPrompt(example.prompt)
                    handleGenerate(example.prompt)
                  }}
                  className="rounded-lg border p-2 text-left text-sm transition-colors hover:bg-muted"
                  disabled={isGenerating}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['primary', 'secondary', 'accent', 'background', 'text', 'textMuted'].map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium capitalize">{key}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={design.tokens.colors[key] || '#000000'}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border"
                  />
                  <Input
                    value={design.tokens.colors[key] || ''}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border bg-white/70 p-4">
            <div>
              <h3 className="text-sm font-semibold">Card Style</h3>
              <p className="text-xs text-muted-foreground">
                Controls how cards look in the app preview.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Card Fill</label>
                <select
                  value={design.cardStyle.variant}
                  onChange={(e) =>
                    updateCardStyle({ ...design.cardStyle, variant: e.target.value as any })
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="white">White</option>
                  <option value="tinted">Tinted</option>
                  <option value="glass">Glass</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Border Color</label>
                <select
                  value={design.cardStyle.border}
                  onChange={(e) =>
                    updateCardStyle({ ...design.cardStyle, border: e.target.value as any })
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="none">None</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="accent">Accent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Icon Style</label>
                <select
                  value={design.cardStyle.iconStyle}
                  onChange={(e) =>
                    updateCardStyle({ ...design.cardStyle, iconStyle: e.target.value as any })
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="pill">Pill</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Module Icon Theme</label>
                <select
                  value={design.iconTheme}
                  onChange={(e) => updateIconTheme(e.target.value as any)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                  <option value="duotone">Duotone</option>
                  <option value="glass">Glass</option>
                </select>
              </div>
            </div>
          </div>
          {/* Advanced Storefront Controls */}
          <AdvancedControls />
        </TabsContent>

        <TabsContent value="typography" className="mt-4 space-y-4">
          <div className="grid gap-4">
            {(['heading', 'body'] as const).map((type) => (
              <div key={type} className="space-y-2">
                <label className="text-sm font-semibold capitalize">{type} Font</label>
                <select
                  value={design.tokens.typography?.fontFamily?.[type] || 'Inter'}
                  onChange={(e) => updateFont(type, e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  {FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
                <div
                  className="rounded-lg border p-3"
                  style={{ fontFamily: design.tokens.typography?.fontFamily?.[type] }}
                >
                  <p className="text-lg font-bold">Aa Bb Cc 123</p>
                  <p className="text-sm text-muted-foreground">The quick brown fox jumps</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="background" className="mt-4 space-y-4">
          <div className="space-y-3 rounded-xl border bg-white/70 p-4">
            <div>
              <h3 className="text-sm font-semibold">Hero</h3>
              <p className="text-xs text-muted-foreground">
                Set the top hero style for the storefront preview.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Hero Style</label>
                <select
                  value={web.heroStyle}
                  onChange={(e) => updateWebSettings({ heroStyle: e.target.value as any })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Hero Height</label>
                <select
                  value={web.heroHeight}
                  onChange={(e) => updateWebSettings({ heroHeight: e.target.value as any })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="full">Full</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Overlay Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={web.heroOverlayOpacity}
                  onChange={(e) => updateWebSettings({ heroOverlayOpacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
            {web.heroStyle === 'image' && (
              <Input
                value={web.heroBackgroundUrl || ''}
                onChange={(e) => updateWebSettings({ heroBackgroundUrl: e.target.value })}
                placeholder="Hero image URL"
              />
            )}
            {web.heroStyle === 'video' && (
              <Input
                value={web.heroVideoUrl || ''}
                onChange={(e) => updateWebSettings({ heroVideoUrl: e.target.value })}
                placeholder="Hero video URL"
              />
            )}
          </div>
          <div className="space-y-3 rounded-xl border bg-white/70 p-4">
            <div>
              <h3 className="text-sm font-semibold">Web Background</h3>
              <p className="text-xs text-muted-foreground">
                Customize backgrounds, textures, and gradients for the storefront page.
              </p>
            </div>
            <BackgroundPicker
              conferenceId={overview.id || 'demo'}
              backgroundUrl={web.backgroundImageUrl}
              backgroundPattern={web.backgroundPattern}
              gradientStart={web.backgroundGradientStart}
              gradientEnd={web.backgroundGradientEnd}
              patternColor={web.backgroundPatternColor}
              onBackgroundUrlChange={(url) => updateWebSettings({ backgroundImageUrl: url })}
              onPatternChange={(pattern) => {
                updateWebSettings({
                  backgroundPattern: pattern,
                  backgroundGradientStart: pattern ? null : web.backgroundGradientStart,
                  backgroundGradientEnd: pattern ? null : web.backgroundGradientEnd,
                  backgroundImageUrl: pattern ? null : web.backgroundImageUrl,
                })
              }}
              onGradientChange={(start, end) =>
                updateWebSettings({
                  backgroundGradientStart: start,
                  backgroundGradientEnd: end,
                  backgroundPattern: start ? null : web.backgroundPattern,
                  backgroundImageUrl: start ? null : web.backgroundImageUrl,
                })
              }
              onPatternColorChange={(color) => updateWebSettings({ backgroundPatternColor: color })}
            />
          </div>
          <div className="space-y-3 rounded-xl border bg-white/70 p-4">
            <div>
              <h3 className="text-sm font-semibold">App Background</h3>
              <p className="text-xs text-muted-foreground">
                Control patterns and gradients inside the customer app preview.
              </p>
            </div>
            <BackgroundPicker
              conferenceId={overview.id || 'demo'}
              backgroundUrl={app.backgroundImageUrl}
              backgroundPattern={app.backgroundPattern}
              gradientStart={app.backgroundGradientStart}
              gradientEnd={app.backgroundGradientEnd}
              patternColor={app.backgroundPatternColor}
              onBackgroundUrlChange={(url) => updateAppSettings({ backgroundImageUrl: url })}
              onPatternChange={(pattern) => {
                updateAppSettings({
                  backgroundPattern: pattern,
                  backgroundGradientStart: pattern ? null : app.backgroundGradientStart,
                  backgroundGradientEnd: pattern ? null : app.backgroundGradientEnd,
                  backgroundImageUrl: pattern ? null : app.backgroundImageUrl,
                })
              }}
              onGradientChange={(start, end) =>
                updateAppSettings({
                  backgroundGradientStart: start,
                  backgroundGradientEnd: end,
                  backgroundPattern: start ? null : app.backgroundPattern,
                  backgroundImageUrl: start ? null : app.backgroundImageUrl,
                })
              }
              onPatternColorChange={(color) => updateAppSettings({ backgroundPatternColor: color })}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
