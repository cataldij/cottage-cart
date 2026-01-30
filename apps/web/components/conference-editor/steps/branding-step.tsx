'use client'

import { useState } from 'react'
import { useConferenceEditor } from '@/contexts/conference-editor-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Sparkles, Type, Loader2 } from 'lucide-react'

const COLOR_PRESETS = [
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#6366f1' },
  { name: 'Forest', primary: '#22c55e', secondary: '#14b8a6' },
  { name: 'Sunset', primary: '#f97316', secondary: '#ef4444' },
  { name: 'Royal', primary: '#8b5cf6', secondary: '#ec4899' },
  { name: 'Midnight', primary: '#1e293b', secondary: '#475569' },
  { name: 'Corporate', primary: '#2563eb', secondary: '#7c3aed' },
]

export function BrandingStep() {
  const { state, updateConference } = useConferenceEditor()
  const { conference } = state
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)

    try {
      // TODO: Call AI API to generate design
      // For now, just pick a random preset
      const preset = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      updateConference({
        primaryColor: preset.primary,
        secondaryColor: preset.secondary,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Palette className="h-5 w-5 text-violet-600" />
          Branding & Design
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Customize the look and feel of your conference app.
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
        </TabsList>

        {/* AI Generate Tab */}
        <TabsContent value="ai" className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Describe your conference style</Label>
              <textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A modern tech conference with a futuristic feel, using blues and purples..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Design
                </>
              )}
            </Button>
          </div>

          {/* Quick presets */}
          <div className="space-y-3">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateConference({
                    primaryColor: preset.primary,
                    secondaryColor: preset.secondary,
                  })}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex gap-1">
                    <div
                      className="h-6 w-6 rounded-full shadow-sm"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="h-6 w-6 rounded-full shadow-sm"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-xl border-2 border-white shadow-lg"
                  style={{ backgroundColor: conference.primaryColor }}
                />
                <Input
                  id="primaryColor"
                  type="color"
                  value={conference.primaryColor}
                  onChange={(e) => updateConference({ primaryColor: e.target.value })}
                  className="h-12 w-full cursor-pointer"
                />
              </div>
              <Input
                value={conference.primaryColor}
                onChange={(e) => updateConference({ primaryColor: e.target.value })}
                placeholder="#2563eb"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-xl border-2 border-white shadow-lg"
                  style={{ backgroundColor: conference.secondaryColor }}
                />
                <Input
                  id="secondaryColor"
                  type="color"
                  value={conference.secondaryColor}
                  onChange={(e) => updateConference({ secondaryColor: e.target.value })}
                  className="h-12 w-full cursor-pointer"
                />
              </div>
              <Input
                value={conference.secondaryColor}
                onChange={(e) => updateConference({ secondaryColor: e.target.value })}
                placeholder="#8b5cf6"
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Preview gradient */}
          <div className="space-y-3">
            <Label>Preview</Label>
            <div
              className="h-24 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${conference.primaryColor}, ${conference.secondaryColor})`,
              }}
            />
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="mt-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">
              Typography customization will use the system font stack by default for optimal readability across all devices.
            </p>
            <div className="mt-4 space-y-3">
              <div
                className="text-2xl font-bold"
                style={{ color: conference.primaryColor }}
              >
                {conference.name || 'Conference Name'}
              </div>
              <div className="text-lg text-slate-600">
                {conference.tagline || 'Your conference tagline here'}
              </div>
              <div className="text-sm text-slate-500">
                Body text will appear like this throughout your conference app.
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
