'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// =============================================
// DESIGN TOKEN TYPES (duplicated for client-side)
// =============================================

interface ColorTokens {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  [key: string]: string;
}

interface TypographyTokens {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
}

interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  animation: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
}

// Default tokens
const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: '#0066FF',
    primaryLight: '#3385FF',
    primaryDark: '#0052CC',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#FFFFFF',
    backgroundAlt: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  typography: {
    fontFamily: {
      heading: 'Inter',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

// =============================================
// CONTEXT TYPES
// =============================================

interface DesignSystemContextValue {
  tokens: DesignTokens;
  isLoading: boolean;
  conferenceId: string | null;

  // Token manipulation
  setTokens: (tokens: DesignTokens) => void;
  updateColor: (key: string, value: string) => void;
  updateFont: (type: 'heading' | 'body' | 'mono', value: string) => void;

  // AI generation
  generateFromPrompt: (prompt: string) => Promise<DesignTokens | null>;
  isGenerating: boolean;

  // Persistence
  saveTokens: () => Promise<boolean>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Presets
  applyPreset: (presetSlug: string) => Promise<boolean>;

  // CSS helpers
  getCSSVariables: () => Record<string, string>;
  getCSSString: () => string;
}

const DesignSystemContext = createContext<DesignSystemContextValue | null>(null);

// =============================================
// PROVIDER COMPONENT
// =============================================

interface DesignSystemProviderProps {
  conferenceId: string | null;
  initialTokens?: DesignTokens;
  children: React.ReactNode;
  demoMode?: boolean;
}

export function DesignSystemProvider({
  conferenceId,
  initialTokens,
  children,
  demoMode = false,
}: DesignSystemProviderProps) {
  const [tokens, setTokensState] = useState<DesignTokens>(initialTokens || DEFAULT_TOKENS);
  const [savedTokens, setSavedTokens] = useState<DesignTokens>(initialTokens || DEFAULT_TOKENS);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState<DesignTokens[]>([initialTokens || DEFAULT_TOKENS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Load tokens when conferenceId changes (skip in demo mode)
  useEffect(() => {
    if (!conferenceId || demoMode) return;

    async function loadTokens() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('design_tokens')
          .select('tokens')
          .eq('conference_id', conferenceId)
          .eq('is_active', true)
          .single();

        if (data?.tokens) {
          setTokensState(data.tokens);
          setSavedTokens(data.tokens);
          setHistory([data.tokens]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTokens();
  }, [conferenceId, supabase, demoMode]);

  // Inject CSS variables into document
  useEffect(() => {
    const cssVars = getCSSVariables();
    const root = document.documentElement;

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      // Cleanup on unmount
      Object.keys(cssVars).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [tokens]);

  // Set tokens with history tracking
  const setTokens = useCallback((newTokens: DesignTokens) => {
    setTokensState(newTokens);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTokens);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Update a single color
  const updateColor = useCallback((key: string, value: string) => {
    setTokens({
      ...tokens,
      colors: {
        ...tokens.colors,
        [key]: value,
      },
    });
  }, [tokens, setTokens]);

  // Update a font
  const updateFont = useCallback((type: 'heading' | 'body' | 'mono', value: string) => {
    setTokens({
      ...tokens,
      typography: {
        ...tokens.typography,
        fontFamily: {
          ...tokens.typography.fontFamily,
          [type]: value,
        },
      },
    });
  }, [tokens, setTokens]);

  // Generate tokens from AI prompt
  const generateFromPrompt = useCallback(async (prompt: string): Promise<DesignTokens | null> => {
    console.log('Generating design from prompt:', prompt);
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/design-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to generate tokens: ${response.status}`);
      }

      const data = await response.json();
      console.log('Generated data:', data);

      if (data.tokens) {
        console.log('Setting new tokens:', data.tokens);
        setTokens(data.tokens);
        return data.tokens;
      } else if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(data.error);
      }
      return null;
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [setTokens]);

  // Save tokens to database (shows alert in demo mode)
  const saveTokens = useCallback(async (): Promise<boolean> => {
    if (demoMode) {
      alert('Saving is disabled in demo mode. Sign up to save your designs!');
      return false;
    }
    if (!conferenceId) return false;

    setIsSaving(true);
    try {
      // Get current version
      const { data: current } = await supabase
        .from('design_tokens')
        .select('id, version')
        .eq('conference_id', conferenceId)
        .eq('is_active', true)
        .single();

      const newVersion = current ? current.version + 1 : 1;

      // Deactivate current
      if (current) {
        await supabase
          .from('design_tokens')
          .update({ is_active: false })
          .eq('id', current.id);
      }

      // Insert new version
      const { error } = await supabase
        .from('design_tokens')
        .insert({
          conference_id: conferenceId,
          version: newVersion,
          is_active: true,
          tokens,
        });

      if (error) throw error;

      setSavedTokens(tokens);
      return true;
    } catch (error) {
      console.error('Error saving tokens:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [conferenceId, tokens, supabase, demoMode]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTokensState(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTokensState(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Apply a preset (shows alert in demo mode)
  const applyPreset = useCallback(async (presetSlug: string): Promise<boolean> => {
    if (demoMode) {
      alert('Presets are disabled in demo mode. Sign up to use design presets!');
      return false;
    }
    try {
      const { data: preset, error } = await supabase
        .from('design_presets')
        .select('tokens')
        .eq('slug', presetSlug)
        .single();

      if (error || !preset?.tokens) {
        console.error('Error fetching preset:', error);
        return false;
      }

      setTokens(preset.tokens);
      return true;
    } catch (error) {
      console.error('Error applying preset:', error);
      return false;
    }
  }, [setTokens, supabase, demoMode]);

  // CSS helpers
  const getCSSVariables = useCallback((): Record<string, string> => {
    const vars: Record<string, string> = {};

    // Colors
    Object.entries(tokens.colors).forEach(([key, value]) => {
      vars[`--color-${kebabCase(key)}`] = value;
    });

    // Typography
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      vars[`--font-${key}`] = value;
    });
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      vars[`--text-${key}`] = value;
    });
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      vars[`--font-weight-${key}`] = String(value);
    });
    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      vars[`--leading-${key}`] = String(value);
    });

    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      vars[`--space-${key}`] = value;
    });

    // Border radius
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      vars[`--radius-${key}`] = value;
    });

    // Shadows
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      vars[`--shadow-${key}`] = value;
    });

    // Animation
    Object.entries(tokens.animation.duration).forEach(([key, value]) => {
      vars[`--duration-${key}`] = value;
    });
    Object.entries(tokens.animation.easing).forEach(([key, value]) => {
      vars[`--ease-${key}`] = value;
    });

    return vars;
  }, [tokens]);

  const getCSSString = useCallback((): string => {
    const vars = getCSSVariables();
    const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
    return `:root {\n${lines.join('\n')}\n}`;
  }, [getCSSVariables]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(tokens) !== JSON.stringify(savedTokens);
  }, [tokens, savedTokens]);

  const value: DesignSystemContextValue = {
    tokens,
    isLoading,
    conferenceId,
    setTokens,
    updateColor,
    updateFont,
    generateFromPrompt,
    isGenerating,
    saveTokens,
    isSaving,
    hasUnsavedChanges,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    applyPreset,
    getCSSVariables,
    getCSSString,
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
}

// =============================================
// HOOK
// =============================================

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

// Helper function
function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
