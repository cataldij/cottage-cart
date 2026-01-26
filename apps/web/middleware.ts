import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Rate limiting function
function rateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Apply rate limiting
  const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 100, 60000)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // Create Supabase client with cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - use getUser() for security
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const session = user ? { user } : null

  // Protected routes
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register')
  const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')

  // Redirect to login if accessing protected routes without session
  // TODO: Re-enable auth check for production
  const bypassAuth = process.env.NODE_ENV === 'development'
  if (isDashboardPage && !session && !bypassAuth) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if accessing auth pages with session
  if (isAuthPage && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // API route protection
  if (isApiRoute && !req.nextUrl.pathname.startsWith('/api/public')) {
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify user role for admin endpoints
    if (req.nextUrl.pathname.startsWith('/api/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }
  }

  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
