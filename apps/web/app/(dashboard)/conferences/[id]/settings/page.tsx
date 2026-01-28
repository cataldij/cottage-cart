'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Loader2,
  Save,
  Palette,
  Layout,
  Settings,
  Share2,
  Mail,
  Smartphone,
  Eye,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Conference = {
  id: string
  name: string
  slug: string
  [key: string]: any
}

type ThemePreset = {
  id: string
  name: string
  slug: string
  description: string | null
  preview_image_url: string | null
  primary_color: string
  secondary_color: string | null
  accent_color: string | null
  background_color: string | null
  font_heading: string | null
  font_body: string | null
}

export default function ConferenceSettingsPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [conference, setConference] = useState<Conference | null>(null)
  const [themePresets, setThemePresets] = useState<ThemePreset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('branding')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadData() {
      const { data: conf } = await supabase
        .from('conferences')
        .select('*')
        .eq('id', params.id)
        .single()

      if (conf) {
        setConference(conf)
      }

      const { data: presets } = await supabase
        .from('theme_presets')
        .select('*')
        .eq('is_public', true)
        .order('name')

      setThemePresets(presets || [])
      setIsLoading(false)
    }

    loadData()
  }, [params.id, supabase])

  const updateField = (field: string, value: any) => {
    setConference((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const saveSettings = async () => {
    if (!conference) return

    setIsSaving(true)
    setSaveSuccess(false)

    const { error } = await supabase
      .from('conferences')
      .update(conference)
      .eq('id', conference.id)

    setIsSaving(false)

    if (!error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const applyThemePreset = (preset: ThemePreset) => {
    setConference((prev) => {
      if (!prev) return null
      return {
        ...prev,
        theme_preset: preset.slug,
        primary_color: preset.primary_color,
        secondary_color: preset.secondary_color,
        accent_color: preset.accent_color,
        background_color: preset.background_color,
        font_heading: preset.font_heading,
        font_body: preset.font_body,
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!conference) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Conference not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/conferences/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Customize {conference.name}</h1>
            <p className="text-muted-foreground">
              Make your conference uniquely yours
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={`/c/${conference.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saveSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden md:inline">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden md:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden md:inline">Emails</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden md:inline">Mobile</span>
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6 mt-6">
          {/* Theme Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Presets</CardTitle>
              <CardDescription>
                Choose a pre-designed theme as a starting point
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyThemePreset(preset)}
                    className={cn(
                      'relative rounded-lg border-2 p-4 text-left transition-all hover:border-primary',
                      conference.theme_preset === preset.slug
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-muted'
                    )}
                  >
                    <div
                      className="h-16 rounded-md mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${preset.primary_color}, ${preset.secondary_color || preset.primary_color})`,
                      }}
                    />
                    <p className="font-medium">{preset.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {preset.description}
                    </p>
                    {conference.theme_preset === preset.slug && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>
                Customize your conference color palette
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={conference.primary_color || '#2563eb'}
                  onChange={(v) => updateField('primary_color', v)}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={conference.secondary_color || '#1e40af'}
                  onChange={(v) => updateField('secondary_color', v)}
                />
                <ColorPicker
                  label="Accent Color"
                  value={conference.accent_color || '#f59e0b'}
                  onChange={(v) => updateField('accent_color', v)}
                />
                <ColorPicker
                  label="Background"
                  value={conference.background_color || '#ffffff'}
                  onChange={(v) => updateField('background_color', v)}
                />
                <ColorPicker
                  label="Text Color"
                  value={conference.text_color || '#1f2937'}
                  onChange={(v) => updateField('text_color', v)}
                />
                <ColorPicker
                  label="Heading Color"
                  value={conference.heading_color || '#111827'}
                  onChange={(v) => updateField('heading_color', v)}
                />
                <ColorPicker
                  label="Nav Background"
                  value={conference.nav_background_color || '#ffffff'}
                  onChange={(v) => updateField('nav_background_color', v)}
                />
                <ColorPicker
                  label="Button Color"
                  value={conference.button_color || conference.primary_color || '#2563eb'}
                  onChange={(v) => updateField('button_color', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Choose fonts for your conference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heading Font</label>
                  <select
                    value={conference.font_heading || 'Inter'}
                    onChange={(e) => updateField('font_heading', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="DM Sans">DM Sans</option>
                    <option value="Outfit">Outfit</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Body Font</label>
                  <select
                    value={conference.font_body || 'Inter'}
                    onChange={(e) => updateField('font_body', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Source Sans Pro">Source Sans Pro</option>
                    <option value="Poppins">Poppins</option>
                    <option value="DM Sans">DM Sans</option>
                    <option value="Lora">Lora</option>
                    <option value="Outfit">Outfit</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Upload your conference branding images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input
                    value={conference.logo_url || ''}
                    onChange={(e) => updateField('logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Banner/Hero Image URL</label>
                  <Input
                    value={conference.banner_url || ''}
                    onChange={(e) => updateField('banner_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Favicon URL</label>
                  <Input
                    value={conference.favicon_url || ''}
                    onChange={(e) => updateField('favicon_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Social Share Image URL</label>
                  <Input
                    value={conference.og_image_url || ''}
                    onChange={(e) => updateField('og_image_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dark Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Dark Mode</CardTitle>
              <CardDescription>Configure dark mode colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dark_mode_enabled"
                  checked={conference.dark_mode_enabled || false}
                  onChange={(e) => updateField('dark_mode_enabled', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="dark_mode_enabled" className="text-sm font-medium">
                  Enable dark mode toggle for attendees
                </label>
              </div>
              {conference.dark_mode_enabled && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                  <ColorPicker
                    label="Dark Background"
                    value={conference.dark_background_color || '#0f172a'}
                    onChange={(v) => updateField('dark_background_color', v)}
                  />
                  <ColorPicker
                    label="Dark Text"
                    value={conference.dark_text_color || '#f1f5f9'}
                    onChange={(v) => updateField('dark_text_color', v)}
                  />
                  <ColorPicker
                    label="Dark Nav"
                    value={conference.dark_nav_background_color || '#1e293b'}
                    onChange={(v) => updateField('dark_nav_background_color', v)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Customize the hero area of your conference page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hero Style</label>
                  <select
                    value={conference.hero_style || 'full'}
                    onChange={(e) => updateField('hero_style', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="full">Full Width Banner</option>
                    <option value="split">Split (Image + Text)</option>
                    <option value="minimal">Minimal</option>
                    <option value="centered">Centered Content</option>
                    <option value="video">Video Background</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hero Height</label>
                  <select
                    value={conference.hero_height || 'medium'}
                    onChange={(e) => updateField('hero_height', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="small">Small (200px)</option>
                    <option value="medium">Medium (320px)</option>
                    <option value="large">Large (480px)</option>
                    <option value="full">Full Screen</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Hero Overlay Opacity: {Math.round((conference.hero_overlay_opacity || 0.3) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={conference.hero_overlay_opacity || 0.3}
                  onChange={(e) => updateField('hero_overlay_opacity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              {conference.hero_style === 'video' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hero Video URL</label>
                  <Input
                    value={conference.hero_video_url || ''}
                    onChange={(e) => updateField('hero_video_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              <CardDescription>Customize registration text and messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Headline</label>
                  <Input
                    value={conference.registration_headline || 'Join Us'}
                    onChange={(e) => updateField('registration_headline', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Text</label>
                  <Input
                    value={conference.registration_button_text || 'Register Now'}
                    onChange={(e) => updateField('registration_button_text', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Registration Description</label>
                <Textarea
                  value={conference.registration_description || ''}
                  onChange={(e) => updateField('registration_description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Success Message</label>
                <Textarea
                  value={conference.registration_success_message || ''}
                  onChange={(e) => updateField('registration_success_message', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable features for your conference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureToggle
                  label="Networking"
                  description="Allow attendees to connect with each other"
                  checked={conference.feature_networking !== false}
                  onChange={(v) => updateField('feature_networking', v)}
                />
                <FeatureToggle
                  label="Attendee Directory"
                  description="Show public list of attendees"
                  checked={conference.feature_attendee_directory !== false}
                  onChange={(v) => updateField('feature_attendee_directory', v)}
                />
                <FeatureToggle
                  label="Session Q&A"
                  description="Allow questions during sessions"
                  checked={conference.feature_session_qa !== false}
                  onChange={(v) => updateField('feature_session_qa', v)}
                />
                <FeatureToggle
                  label="Live Polls"
                  description="Run polls during sessions"
                  checked={conference.feature_live_polls !== false}
                  onChange={(v) => updateField('feature_live_polls', v)}
                />
                <FeatureToggle
                  label="Chat Rooms"
                  description="Enable group messaging"
                  checked={conference.feature_chat !== false}
                  onChange={(v) => updateField('feature_chat', v)}
                />
                <FeatureToggle
                  label="Session Ratings"
                  description="Allow attendees to rate sessions"
                  checked={conference.feature_session_ratings !== false}
                  onChange={(v) => updateField('feature_session_ratings', v)}
                />
                <FeatureToggle
                  label="Virtual Badges"
                  description="Generate digital badges for attendees"
                  checked={conference.feature_virtual_badges !== false}
                  onChange={(v) => updateField('feature_virtual_badges', v)}
                />
                <FeatureToggle
                  label="Meeting Requests"
                  description="Allow attendees to request 1:1 meetings"
                  checked={conference.feature_meeting_requests !== false}
                  onChange={(v) => updateField('feature_meeting_requests', v)}
                />
                <FeatureToggle
                  label="Sponsor Booths"
                  description="Enable virtual sponsor booths"
                  checked={conference.feature_sponsor_booths !== false}
                  onChange={(v) => updateField('feature_sponsor_booths', v)}
                />
                <FeatureToggle
                  label="Live Streaming"
                  description="Enable live video streaming"
                  checked={conference.feature_live_stream || false}
                  onChange={(v) => updateField('feature_live_stream', v)}
                />
                <FeatureToggle
                  label="Session Recordings"
                  description="Allow access to recorded sessions"
                  checked={conference.feature_recordings !== false}
                  onChange={(v) => updateField('feature_recordings', v)}
                />
                <FeatureToggle
                  label="Certificates"
                  description="Generate attendance certificates"
                  checked={conference.feature_certificates || false}
                  onChange={(v) => updateField('feature_certificates', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Add your conference social media profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Twitter / X</label>
                  <Input
                    value={conference.social_twitter || ''}
                    onChange={(e) => updateField('social_twitter', e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn</label>
                  <Input
                    value={conference.social_linkedin || ''}
                    onChange={(e) => updateField('social_linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instagram</label>
                  <Input
                    value={conference.social_instagram || ''}
                    onChange={(e) => updateField('social_instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">YouTube</label>
                  <Input
                    value={conference.social_youtube || ''}
                    onChange={(e) => updateField('social_youtube', e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Facebook</label>
                  <Input
                    value={conference.social_facebook || ''}
                    onChange={(e) => updateField('social_facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discord</label>
                  <Input
                    value={conference.social_discord || ''}
                    onChange={(e) => updateField('social_discord', e.target.value)}
                    placeholder="https://discord.gg/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer</CardTitle>
              <CardDescription>Customize your conference footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Footer Text</label>
                <Textarea
                  value={conference.footer_text || ''}
                  onChange={(e) => updateField('footer_text', e.target.value)}
                  placeholder="Custom footer text..."
                  rows={2}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Privacy Policy URL</label>
                  <Input
                    value={conference.privacy_policy_url || ''}
                    onChange={(e) => updateField('privacy_policy_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Terms URL</label>
                  <Input
                    value={conference.terms_url || ''}
                    onChange={(e) => updateField('terms_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code of Conduct URL</label>
                  <Input
                    value={conference.code_of_conduct_url || ''}
                    onChange={(e) => updateField('code_of_conduct_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO & Analytics</CardTitle>
              <CardDescription>Optimize for search and track visitors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Title</label>
                <Input
                  value={conference.meta_title || ''}
                  onChange={(e) => updateField('meta_title', e.target.value)}
                  placeholder="Conference Name - Tagline"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea
                  value={conference.meta_description || ''}
                  onChange={(e) => updateField('meta_description', e.target.value)}
                  placeholder="A brief description for search engines..."
                  rows={2}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Google Analytics ID</label>
                  <Input
                    value={conference.google_analytics_id || ''}
                    onChange={(e) => updateField('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Facebook Pixel ID</label>
                  <Input
                    value={conference.facebook_pixel_id || ''}
                    onChange={(e) => updateField('facebook_pixel_id', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Branding</CardTitle>
              <CardDescription>Customize emails sent to attendees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Header Logo URL</label>
                  <Input
                    value={conference.email_header_logo_url || ''}
                    onChange={(e) => updateField('email_header_logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <ColorPicker
                  label="Email Header Color"
                  value={conference.email_header_color || conference.primary_color || '#2563eb'}
                  onChange={(v) => updateField('email_header_color', v)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Footer Text</label>
                <Textarea
                  value={conference.email_footer_text || ''}
                  onChange={(e) => updateField('email_footer_text', e.target.value)}
                  placeholder="Custom footer for all emails..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Email</CardTitle>
              <CardDescription>Sent when someone registers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={conference.email_welcome_subject || 'Welcome to {{conference_name}}!'}
                  onChange={(e) => updateField('email_welcome_subject', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{{conference_name}}'} to insert the conference name
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Body</label>
                <Textarea
                  value={conference.email_welcome_body || ''}
                  onChange={(e) => updateField('email_welcome_body', e.target.value)}
                  placeholder="Custom welcome message..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Tab */}
        <TabsContent value="mobile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Branding</CardTitle>
              <CardDescription>Customize the mobile experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Splash Screen Color"
                  value={conference.mobile_splash_color || conference.primary_color || '#2563eb'}
                  onChange={(v) => updateField('mobile_splash_color', v)}
                />
                <ColorPicker
                  label="App Icon Background"
                  value={conference.mobile_icon_background_color || conference.primary_color || '#2563eb'}
                  onChange={(v) => updateField('mobile_icon_background_color', v)}
                />
                <ColorPicker
                  label="Tab Bar Color"
                  value={conference.mobile_tab_bar_color || '#ffffff'}
                  onChange={(v) => updateField('mobile_tab_bar_color', v)}
                />
                <ColorPicker
                  label="Tab Bar Active Color"
                  value={conference.mobile_tab_bar_active_color || conference.primary_color || '#2563eb'}
                  onChange={(v) => updateField('mobile_tab_bar_active_color', v)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Bar Style</label>
                <select
                  value={conference.mobile_status_bar_style || 'light'}
                  onChange={(e) => updateField('mobile_status_bar_style', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="light">Light (for dark backgrounds)</option>
                  <option value="dark">Dark (for light backgrounds)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced: Custom CSS</CardTitle>
              <CardDescription>Add custom CSS for advanced styling (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={conference.custom_css || ''}
                onChange={(e) => updateField('custom_css', e.target.value)}
                placeholder="/* Your custom CSS here */"
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Color Picker Component
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded border cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  )
}

// Feature Toggle Component
function FeatureToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 rounded"
      />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
