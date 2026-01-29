'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDesignSystem } from '@/contexts/design-system-context';
import { ComponentShowcase } from './component-showcase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Palette,
  Type,
  Sparkles,
  Save,
  Undo2,
  Redo2,
  Loader2,
  CheckCircle,
  Wand2,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Sliders,
  Moon,
  Sun,
  Zap,
  RefreshCcw,
  ChevronRight,
  Quote,
  Lightbulb,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Play,
  Layers,
  Layout,
  Copy,
  Check,
} from 'lucide-react';

// =============================================
// DESIGN CONCEPT DISPLAY
// =============================================

interface DesignConceptProps {
  concept: {
    name: string;
    tagline: string;
    personality: string[];
    inspiration: string;
  } | null;
  rationale: string | null;
  gradients: {
    hero: string;
    accent: string;
    card: string;
  } | null;
}

function DesignConceptDisplay({ concept, rationale, gradients }: DesignConceptProps) {
  if (!concept) return null;

  return (
    <div className="space-y-4 rounded-xl border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold">{concept.name}</h3>
          <p className="text-muted-foreground">{concept.tagline}</p>
        </div>
        <div className="flex gap-1">
          {concept.personality?.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {concept.inspiration && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{concept.inspiration}</span>
        </div>
      )}

      {gradients && (
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <div
              className="h-12 rounded-lg"
              style={{ background: gradients.hero }}
            />
            <p className="text-center text-xs text-muted-foreground">Hero Gradient</p>
          </div>
          <div className="space-y-1">
            <div
              className="h-12 rounded-lg"
              style={{ background: gradients.accent }}
            />
            <p className="text-center text-xs text-muted-foreground">Accent</p>
          </div>
          <div className="space-y-1">
            <div
              className="h-12 rounded-lg border"
              style={{ background: gradients.card }}
            />
            <p className="text-center text-xs text-muted-foreground">Card</p>
          </div>
        </div>
      )}

      {rationale && (
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="italic text-muted-foreground">{rationale}</p>
        </div>
      )}
    </div>
  );
}

// =============================================
// AI PROMPT PANEL WITH REFINEMENTS
// =============================================

interface AIPromptPanelProps {
  onGenerate: (prompt: string, refinement?: string) => Promise<boolean>;
  isGenerating: boolean;
  currentConcept: DesignConceptProps['concept'];
  currentRationale: string | null;
  currentGradients: DesignConceptProps['gradients'];
}

const REFINEMENTS = [
  { id: 'darker', label: 'Darker', icon: Moon },
  { id: 'lighter', label: 'Lighter', icon: Sun },
  { id: 'bold', label: 'Bolder', icon: Zap },
  { id: 'minimal', label: 'Minimal', icon: Sliders },
  { id: 'playful', label: 'Playful', icon: Sparkles },
  { id: 'professional', label: 'Professional', icon: Users },
];

function AIPromptPanel({
  onGenerate,
  isGenerating,
  currentConcept,
  currentRationale,
  currentGradients,
}: AIPromptPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const suggestions = [
    { label: 'Tech Conference', prompt: 'Modern tech startup conference, 500 developers, innovative and cutting-edge, think Stripe meets Linear. Dark mode, glowing accents, premium feel.' },
    { label: 'Academic Summit', prompt: 'International academic research symposium, 200 professors and researchers. Scholarly, intellectual, warm but authoritative. Think Oxford meets TED.' },
    { label: 'Creative Festival', prompt: 'Design and creativity festival, 1000 designers and artists. Bold, vibrant, experimental. Think Adobe MAX meets Figma Config.' },
    { label: 'Executive Summit', prompt: 'C-suite executive leadership summit at a luxury venue. Premium, sophisticated, confident. Think World Economic Forum meets Apple keynote.' },
    { label: 'Startup Demo Day', prompt: 'Y Combinator style demo day for 50 startups. Energetic, optimistic, forward-looking. Silicon Valley energy, investor-ready polish.' },
    { label: 'Healthcare Conference', prompt: 'Medical professionals conference on innovation in healthcare. Clean, trustworthy, modern. Think Mayo Clinic meets Google Health.' },
  ];

  const handleGenerate = async (refinement?: string) => {
    const currentPrompt = refinement ? prompt || 'Current design' : prompt;
    if (!currentPrompt.trim() && !refinement) return;

    setStatus('idle');
    setErrorMessage('');

    try {
      const success = await onGenerate(currentPrompt, refinement);
      if (success) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setErrorMessage('Generation failed. Please try again.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Generation Card */}
      <Card className="overflow-hidden border-2 border-primary/20">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Design Generator</h2>
              <p className="text-sm text-muted-foreground">
                Describe your event and watch the magic happen
              </p>
            </div>
          </div>
        </div>

        <CardContent className="space-y-4 p-6">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your conference... Be specific about the vibe, audience, and feeling you want. The more detail, the better the design."
            className="min-h-[100px] resize-none text-base"
          />

          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => setPrompt(s.prompt)}
                className="rounded-full border bg-background px-3 py-1.5 text-sm transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
              >
                {s.label}
              </button>
            ))}
          </div>

          <Button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            size="lg"
            className={cn(
              "w-full gap-2 text-base",
              status === 'success' && "bg-green-600 hover:bg-green-700"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Your Design...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Design Created!
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Design System
              </>
            )}
          </Button>

          {status === 'error' && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}
        </CardContent>
      </Card>

      {/* Current Design Concept */}
      {currentConcept && (
        <DesignConceptDisplay
          concept={currentConcept}
          rationale={currentRationale}
          gradients={currentGradients}
        />
      )}

      {/* Quick Refinements */}
      {currentConcept && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCcw className="h-4 w-4" />
              Quick Refinements
            </CardTitle>
            <CardDescription>
              Adjust the current design direction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {REFINEMENTS.map((r) => (
                <Button
                  key={r.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate(r.id)}
                  disabled={isGenerating}
                  className="gap-1.5"
                >
                  <r.icon className="h-3.5 w-3.5" />
                  {r.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================
// FULL PAGE CONFERENCE PREVIEW
// =============================================

interface FullPagePreviewProps {
  tokens: any;
  gradients: { hero: string; accent: string; card: string } | null;
  concept: DesignConceptProps['concept'];
  deviceSize: 'mobile' | 'tablet' | 'desktop';
}

function FullPagePreview({ tokens, gradients, concept, deviceSize }: FullPagePreviewProps) {
  const colors = tokens?.colors || {};
  const typography = tokens?.typography || {};
  const borderRadius = tokens?.borderRadius || {};
  const shadows = tokens?.shadows || {};

  const heroGradient = gradients?.hero || `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark || colors.primary})`;
  const cardGradient = gradients?.card || colors.surface;

  const sizes = {
    mobile: { width: 375, scale: 0.9 },
    tablet: { width: 768, scale: 0.55 },
    desktop: { width: 1280, scale: 0.35 },
  };

  const { width, scale } = sizes[deviceSize];

  return (
    <div className="flex h-full items-start justify-center overflow-auto bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:from-slate-900 dark:to-slate-800">
      <div
        className="origin-top rounded-2xl shadow-2xl transition-all duration-500"
        style={{
          width: width,
          minWidth: width,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          backgroundColor: colors.background || '#fff',
        }}
      >
        {/* Navigation */}
        <nav
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: colors.background,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            />
            <span
              className="font-semibold"
              style={{
                color: colors.text,
                fontFamily: typography.fontFamily?.heading,
              }}
            >
              {concept?.name || 'Conference'}
            </span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            {['Schedule', 'Speakers', 'Venue', 'Tickets'].map((item) => (
              <span
                key={item}
                className="text-sm"
                style={{
                  color: colors.textMuted,
                  fontFamily: typography.fontFamily?.body,
                }}
              >
                {item}
              </span>
            ))}
          </div>
          <button
            className="px-4 py-2 text-sm font-medium text-white"
            style={{
              backgroundColor: colors.primary,
              borderRadius: borderRadius.md,
            }}
          >
            Register
          </button>
        </nav>

        {/* Hero Section */}
        <section
          className="relative overflow-hidden px-6 py-20 text-center md:py-32"
          style={{ background: heroGradient }}
        >
          <div className="relative z-10">
            <div
              className="mb-4 inline-block rounded-full px-4 py-1 text-sm font-medium"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
              }}
            >
              March 15-17, 2025 • San Francisco
            </div>
            <h1
              className="mb-4 text-4xl font-extrabold text-white md:text-6xl"
              style={{ fontFamily: typography.fontFamily?.heading }}
            >
              {concept?.name || 'Tech Conference 2025'}
            </h1>
            <p
              className="mx-auto mb-8 max-w-2xl text-lg text-white/80 md:text-xl"
              style={{ fontFamily: typography.fontFamily?.body }}
            >
              {concept?.tagline || 'Where innovation meets inspiration'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: borderRadius.lg,
                  boxShadow: shadows.lg,
                }}
              >
                Get Tickets
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="flex items-center gap-2 border-2 border-white/30 px-6 py-3 font-semibold text-white backdrop-blur-sm"
                style={{ borderRadius: borderRadius.lg }}
              >
                <Play className="h-4 w-4" />
                Watch Trailer
              </button>
            </div>
          </div>

          {/* Decorative elements */}
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20"
            style={{ backgroundColor: colors.accent }}
          />
          <div
            className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-20"
            style={{ backgroundColor: colors.secondary }}
          />
        </section>

        {/* Stats Bar */}
        <section
          className="grid grid-cols-4 gap-4 px-6 py-8"
          style={{ backgroundColor: colors.backgroundAlt }}
        >
          {[
            { icon: Users, label: 'Attendees', value: '2,500+' },
            { icon: Calendar, label: 'Sessions', value: '80+' },
            { icon: Star, label: 'Speakers', value: '45' },
            { icon: MapPin, label: 'Venue', value: 'Moscone' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon
                className="mx-auto mb-2 h-5 w-5"
                style={{ color: colors.primary }}
              />
              <div
                className="text-2xl font-bold"
                style={{
                  color: colors.text,
                  fontFamily: typography.fontFamily?.heading,
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs"
                style={{ color: colors.textMuted }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Featured Speakers */}
        <section className="px-6 py-12" style={{ backgroundColor: colors.background }}>
          <h2
            className="mb-8 text-center text-2xl font-bold md:text-3xl"
            style={{
              color: colors.text,
              fontFamily: typography.fontFamily?.heading,
            }}
          >
            Featured Speakers
          </h2>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden text-center"
                style={{
                  backgroundColor: cardGradient,
                  borderRadius: borderRadius.xl,
                  border: `1px solid ${colors.border}`,
                  boxShadow: shadows.md,
                }}
              >
                <div
                  className="mx-auto mt-4 h-16 w-16 rounded-full md:h-20 md:w-20"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                  }}
                />
                <div className="p-4">
                  <h3
                    className="font-semibold"
                    style={{
                      color: colors.text,
                      fontFamily: typography.fontFamily?.heading,
                    }}
                  >
                    Speaker {i}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    Company Name
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Session Preview */}
        <section className="px-6 py-12" style={{ backgroundColor: colors.backgroundAlt }}>
          <div className="mb-8 flex items-center justify-between">
            <h2
              className="text-2xl font-bold"
              style={{
                color: colors.text,
                fontFamily: typography.fontFamily?.heading,
              }}
            >
              Today's Sessions
            </h2>
            <span
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: colors.primary }}
            >
              View All <ChevronRight className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-3">
            {[
              { time: '9:00 AM', title: 'Opening Keynote', room: 'Main Stage' },
              { time: '10:30 AM', title: 'The Future of AI', room: 'Hall A' },
              { time: '2:00 PM', title: 'Design Systems Workshop', room: 'Workshop Room' },
            ].map((session) => (
              <div
                key={session.title}
                className="flex items-center gap-4 p-4"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="text-center">
                  <Clock className="mx-auto mb-1 h-4 w-4" style={{ color: colors.primary }} />
                  <span
                    className="text-xs font-medium"
                    style={{ color: colors.textMuted }}
                  >
                    {session.time}
                  </span>
                </div>
                <div className="flex-1">
                  <h4
                    className="font-semibold"
                    style={{
                      color: colors.text,
                      fontFamily: typography.fontFamily?.heading,
                    }}
                  >
                    {session.title}
                  </h4>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {session.room}
                  </p>
                </div>
                <button
                  className="px-3 py-1.5 text-sm font-medium"
                  style={{
                    backgroundColor: colors.primary + '20',
                    color: colors.primary,
                    borderRadius: borderRadius.md,
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="px-6 py-16 text-center"
          style={{ background: heroGradient }}
        >
          <h2
            className="mb-4 text-3xl font-bold text-white"
            style={{ fontFamily: typography.fontFamily?.heading }}
          >
            Ready to Join?
          </h2>
          <p className="mx-auto mb-6 max-w-md text-white/80">
            Early bird pricing ends soon. Secure your spot at the most anticipated conference of the year.
          </p>
          <button
            className="px-8 py-4 font-semibold shadow-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: '#fff',
              color: colors.primary,
              borderRadius: borderRadius.lg,
            }}
          >
            Register Now — $299
          </button>
        </section>

        {/* Footer */}
        <footer
          className="px-6 py-8"
          style={{
            backgroundColor: colors.text,
            color: colors.background,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-60">© 2025 Conference OS</span>
            <div className="flex gap-4 text-sm opacity-60">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Contact</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// =============================================
// COLOR EDITOR
// =============================================

interface ColorPickerGridProps {
  colors: Record<string, string>;
  onColorChange: (key: string, value: string) => void;
}

function ColorPickerGrid({ colors, onColorChange }: ColorPickerGridProps) {
  const colorGroups = {
    'Brand Colors': ['primary', 'primaryLight', 'primaryDark', 'secondary', 'accent'],
    'Backgrounds': ['background', 'backgroundAlt', 'surface'],
    'Text': ['text', 'textMuted'],
    'UI': ['border', 'error', 'success', 'warning'],
  };

  return (
    <div className="space-y-8">
      {Object.entries(colorGroups).map(([group, keys]) => (
        <div key={group}>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{group}</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {keys.map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-10 w-10 rounded-lg border shadow-sm"
                    style={{ backgroundColor: colors[key] || '#000' }}
                  />
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={colors[key] || '#000000'}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border"
                  />
                  <Input
                    value={colors[key] || ''}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="h-8 font-mono text-xs"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================
// TYPOGRAPHY EDITOR
// =============================================

interface TypographyEditorProps {
  typography: {
    fontFamily: { heading: string; body: string; mono: string };
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  onFontChange: (type: 'heading' | 'body' | 'mono', value: string) => void;
}

// Comprehensive Google Fonts list organized by style
const FONT_OPTIONS = [
  // Modern Sans-Serif (Headings)
  'Inter', 'Poppins', 'Space Grotesk', 'DM Sans', 'Outfit', 'Plus Jakarta Sans',
  'Manrope', 'Satoshi', 'General Sans', 'Clash Display', 'Cabinet Grotesk',
  'Syne', 'Unbounded', 'Bricolage Grotesque', 'Onest',

  // Classic Sans-Serif
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Raleway', 'Nunito', 'Source Sans 3',
  'Work Sans', 'Rubik', 'Quicksand', 'Karla', 'Archivo', 'Figtree', 'Albert Sans',

  // Display & Bold
  'Bebas Neue', 'Oswald', 'Anton', 'Teko', 'Barlow Condensed', 'Fjalla One',
  'Lexend', 'Red Hat Display', 'Urbanist', 'Sora', 'Exo 2', 'Orbitron',

  // Elegant Serif
  'Playfair Display', 'Cormorant Garamond', 'Lora', 'Merriweather', 'Libre Baskerville',
  'Crimson Text', 'Source Serif 4', 'EB Garamond', 'Bitter', 'Spectral',
  'Fraunces', 'Newsreader', 'Literata', 'Bodoni Moda',

  // Modern Serif
  'DM Serif Display', 'Abril Fatface', 'Cardo', 'Noto Serif', 'IBM Plex Serif',

  // Monospace
  'JetBrains Mono', 'Fira Code', 'IBM Plex Mono', 'Source Code Pro', 'Roboto Mono',
  'Space Mono', 'Inconsolata', 'Ubuntu Mono', 'Overpass Mono', 'Geist Mono',

  // Handwritten & Script
  'Caveat', 'Pacifico', 'Dancing Script', 'Satisfy', 'Great Vibes', 'Lobster',
  'Sacramento', 'Allura', 'Kalam', 'Shadows Into Light',

  // Unique & Experimental
  'Righteous', 'Permanent Marker', 'Press Start 2P', 'Monoton', 'Bungee',
  'Comfortaa', 'Fredoka', 'Lilita One', 'Russo One', 'Titan One',
];

function TypographyEditor({ typography, onFontChange }: TypographyEditorProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {(['heading', 'body', 'mono'] as const).map((type) => (
          <div key={type} className="space-y-3">
            <label className="text-sm font-semibold capitalize">{type} Font</label>
            <select
              value={typography.fontFamily[type]}
              onChange={(e) => onFontChange(type, e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
            <div
              className="rounded-lg border p-4"
              style={{ fontFamily: typography.fontFamily[type] }}
            >
              <p className="text-2xl font-bold">Aa Bb Cc</p>
              <p className="text-sm text-muted-foreground">The quick brown fox jumps</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold">Type Scale Preview</h3>
        <div className="space-y-2 rounded-lg border p-4">
          {Object.entries(typography.fontSize).slice(0, 7).map(([key, value]) => (
            <div key={key} className="flex items-baseline gap-4">
              <span className="w-12 text-xs text-muted-foreground">{key}</span>
              <span
                style={{
                  fontSize: value,
                  fontFamily: typography.fontFamily.body,
                  lineHeight: 1.4,
                }}
              >
                Conference Typography
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================
// MAIN DESIGN EDITOR
// =============================================

interface DesignEditorProps {
  conferenceId: string;
}

export function DesignEditor({ conferenceId }: DesignEditorProps) {
  const {
    tokens,
    isLoading,
    isGenerating,
    isSaving,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    setTokens,
    updateColor,
    updateFont,
    generateFromPrompt,
    saveTokens,
    undo,
    redo,
  } = useDesignSystem();

  // Dynamically load Google Fonts when typography changes
  useEffect(() => {
    const fonts = tokens.typography?.fontFamily;
    if (!fonts) return;

    const fontFamilies = [fonts.heading, fonts.body, fonts.mono].filter(Boolean);
    const uniqueFonts = [...new Set(fontFamilies)];

    // Remove old font links
    document.querySelectorAll('link[data-dynamic-font]').forEach(el => el.remove());

    // Add new font links
    uniqueFonts.forEach(font => {
      const fontName = font.replace(/ /g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`;
      link.rel = 'stylesheet';
      link.setAttribute('data-dynamic-font', font);
      document.head.appendChild(link);
    });
  }, [tokens.typography?.fontFamily]);

  const [activeTab, setActiveTab] = useState('ai');
  const [deviceSize, setDeviceSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [previewMode, setPreviewMode] = useState<'page' | 'components'>('page');
  const [isDarkPreview, setIsDarkPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCSS, setCopiedCSS] = useState(false);

  // Extended design data from AI
  const [designConcept, setDesignConcept] = useState<DesignConceptProps['concept']>(null);
  const [designRationale, setDesignRationale] = useState<string | null>(null);
  const [gradients, setGradients] = useState<DesignConceptProps['gradients']>(null);
  const [darkModeTokens, setDarkModeTokens] = useState<any>(null);
  const [componentStyle, setComponentStyle] = useState<any>(null);

  const handleSave = async () => {
    const success = await saveTokens();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleGenerate = async (prompt: string, refinement?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/design-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, refinement }),
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.tokens) {
        // Update tokens directly
        setTokens(data.tokens);

        // Store extended design data
        if (data.designConcept) setDesignConcept(data.designConcept);
        if (data.designRationale) setDesignRationale(data.designRationale);
        if (data.gradients) setGradients(data.gradients);
        if (data.darkMode) setDarkModeTokens(data.darkMode);
        if (data.componentStyle) setComponentStyle(data.componentStyle);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  };

  // Copy CSS to clipboard
  const handleCopyCSS = async () => {
    const cssVars = Object.entries(tokens.colors || {})
      .map(([key, value]) => `  --color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      .join('\n');

    const css = `:root {\n${cssVars}\n}`;
    await navigator.clipboard.writeText(css);
    setCopiedCSS(true);
    setTimeout(() => setCopiedCSS(false), 2000);
  };

  // Get display tokens (swap for dark mode if needed)
  const displayTokens = isDarkPreview && darkModeTokens
    ? {
        ...tokens,
        colors: {
          ...tokens.colors,
          ...darkModeTokens,
        },
      }
    : tokens;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Editor Panel */}
      <div className="flex w-[500px] shrink-0 flex-col overflow-hidden rounded-xl border bg-background">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}>
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saveSuccess ? 'Saved!' : 'Save'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-3 mt-3 grid grid-cols-3">
            <TabsTrigger value="ai" className="gap-1.5">
              <Wand2 className="h-4 w-4" />
              AI Magic
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-1.5">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-1.5">
              <Type className="h-4 w-4" />
              Typography
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="ai" className="mt-0">
              <AIPromptPanel
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                currentConcept={designConcept}
                currentRationale={designRationale}
                currentGradients={gradients}
              />
            </TabsContent>

            <TabsContent value="colors" className="mt-0">
              <ColorPickerGrid
                colors={tokens.colors as Record<string, string>}
                onColorChange={updateColor}
              />
            </TabsContent>

            <TabsContent value="typography" className="mt-0">
              <TypographyEditor
                typography={tokens.typography}
                onFontChange={updateFont}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-muted/30">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between border-b bg-background p-3">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-muted p-1">
              <button
                onClick={() => setPreviewMode('page')}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  previewMode === 'page' && "bg-background shadow-sm"
                )}
              >
                <Layout className="h-4 w-4" />
                Page
              </button>
              <button
                onClick={() => setPreviewMode('components')}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  previewMode === 'components' && "bg-background shadow-sm"
                )}
              >
                <Layers className="h-4 w-4" />
                Components
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            {darkModeTokens && (
              <Button
                variant={isDarkPreview ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIsDarkPreview(!isDarkPreview)}
                className="gap-1.5"
              >
                {isDarkPreview ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDarkPreview ? 'Dark' : 'Light'}
              </Button>
            )}

            {/* Copy CSS */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCSS}
              className="gap-1.5"
            >
              {copiedCSS ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedCSS ? 'Copied!' : 'Copy CSS'}
            </Button>

            {/* Device Size (only for page view) */}
            {previewMode === 'page' && (
              <div className="flex gap-1 border-l pl-2">
                {(['mobile', 'tablet', 'desktop'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={deviceSize === size ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDeviceSize(size)}
                  >
                    {size === 'mobile' && <Smartphone className="h-4 w-4" />}
                    {size === 'tablet' && <Tablet className="h-4 w-4" />}
                    {size === 'desktop' && <Monitor className="h-4 w-4" />}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {previewMode === 'page' ? (
            <FullPagePreview
              tokens={displayTokens}
              gradients={gradients}
              concept={designConcept}
              deviceSize={deviceSize}
            />
          ) : (
            <div className="h-full overflow-auto">
              <ComponentShowcase
                tokens={displayTokens}
                gradients={gradients}
                componentStyle={componentStyle}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
