import { useState, useEffect, useMemo, createContext, useContext, ReactNode } from 'react'
import { supabase } from '@conference-os/api'

// Full design token structure matching the web builder
export interface DesignTokens {
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    secondary: string
    accent: string
    background: string
    backgroundAlt: string
    surface: string
    text: string
    textMuted: string
    border: string
    error: string
    success: string
    warning: string
  }
  typography: {
    fontFamily: {
      heading: string
      body: string
      mono: string
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
      '5xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    full: string
  }
  shadows: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  animation: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      default: string
      in: string
      out: string
      bounce: string
    }
  }
  // Mobile-specific
  mobile?: {
    splashBackgroundColor?: string
    statusBarStyle?: 'light' | 'dark' | 'auto'
    tabBarBlur?: boolean
    gradientHero?: string
  }
  // App-specific preview/runtime settings from builder
  app?: {
    backgroundPattern?: string | null
    backgroundPatternColor?: string | null
    backgroundGradientStart?: string | null
    backgroundGradientEnd?: string | null
    backgroundImageUrl?: string | null
    backgroundImageOverlay?: number | null
  }
}

// Default tokens matching the "Tech Minimal" preset
export const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#6b7280',
    accent: '#10b981',
    background: '#ffffff',
    backgroundAlt: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
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
  mobile: {
    splashBackgroundColor: '#2563eb',
    statusBarStyle: 'light',
    tabBarBlur: true,
    gradientHero: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  },
}

interface DesignTokensContextType {
  tokens: DesignTokens
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const DesignTokensContext = createContext<DesignTokensContextType | undefined>(undefined)

interface DesignTokensProviderProps {
  conferenceId: string | null
  children: ReactNode
}

export function DesignTokensProvider({ conferenceId, children }: DesignTokensProviderProps) {
  const [tokens, setTokens] = useState<DesignTokens>(DEFAULT_TOKENS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = async () => {
    if (!conferenceId) {
      setTokens(DEFAULT_TOKENS)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch the active design tokens for this conference
      const { data, error: fetchError } = await supabase
        .from('design_tokens')
        .select('tokens')
        .eq('conference_id', conferenceId)
        .eq('is_active', true)
        .single()

      if (fetchError) {
        // If no tokens found, use defaults (conference might not have custom design yet)
        if (fetchError.code === 'PGRST116') {
          console.log('No design tokens found for conference, using defaults')
          setTokens(DEFAULT_TOKENS)
        } else {
          throw fetchError
        }
      } else if (data?.tokens) {
        // Merge fetched tokens with defaults (in case some fields are missing)
        setTokens(deepMerge(DEFAULT_TOKENS, data.tokens as Partial<DesignTokens>))
      }
    } catch (err: any) {
      console.error('Error fetching design tokens:', err)
      setError(err.message || 'Failed to fetch design tokens')
      // Keep using defaults on error
      setTokens(DEFAULT_TOKENS)
    } finally {
      setIsLoading(false)
    }
  }

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conferenceId) return

    // Initial fetch
    fetchTokens()

    // Subscribe to changes
    const channel = supabase
      .channel(`design_tokens:${conferenceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'design_tokens',
          filter: `conference_id=eq.${conferenceId}`,
        },
        (payload) => {
          console.log('Design tokens updated:', payload)
          // Refetch on any change (INSERT, UPDATE, DELETE)
          fetchTokens()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conferenceId])

  const value = useMemo(
    () => ({
      tokens,
      isLoading,
      error,
      refetch: fetchTokens,
    }),
    [tokens, isLoading, error]
  )

  return (
    <DesignTokensContext.Provider value={value}>
      {children}
    </DesignTokensContext.Provider>
  )
}

export function useDesignTokens() {
  const context = useContext(DesignTokensContext)
  if (context === undefined) {
    throw new Error('useDesignTokens must be used within a DesignTokensProvider')
  }
  return context
}

// Helper function for deep merging objects
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof (target as any)[key] === 'object' &&
        (target as any)[key] !== null
      ) {
        (result as any)[key] = deepMerge((target as any)[key], source[key] as any)
      } else {
        (result as any)[key] = source[key]
      }
    }
  }

  return result
}
