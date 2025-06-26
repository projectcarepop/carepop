import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/about',
    '/contact',
    '/clinic-finder',
    '/download-app',
    '/sign-in', 
    '/sign-up', 
    '/forgot-password', 
    '/update-password', 
    '/auth/callback', 
    '/auth/confirm', 
    '/terms-of-service', 
    '/privacy-policy'
  ]

  // Auth-related pages that logged-in users should not see
  const authPages = ['/sign-in', '/sign-up', '/forgot-password']


  if (user) {
    // User is authenticated
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
        // PGRST116: 'No rows found' - this is not an actual error in our case
        console.error('Middleware profile check error:', error)
        // For now, we'll let them pass to avoid blocking access due to transient db issues.
    }

    const hasProfile = !!profile

    if (hasProfile) {
      // User has a profile, they should not be on auth pages.
      if (authPages.includes(pathname)) {
        return NextResponse.redirect(new URL('/main-dashboard', request.url))
      }
      
      // The redirect from /create-profile should ONLY happen if we are NOT in edit mode.
      if (pathname === '/create-profile' && request.nextUrl.searchParams.get('mode') !== 'edit') {
        return NextResponse.redirect(new URL('/main-dashboard', request.url))
      }

    } else {
      // User does not have a profile
      // Allow access only to the create-profile page, and auth pages needed to get there
      const allowedPaths = ['/create-profile', ...publicPaths];
      if (!allowedPaths.includes(pathname)) {
        return NextResponse.redirect(new URL('/create-profile', request.url))
      }
    }
  } else {
    // User is not authenticated
    // If trying to access a protected page, redirect to sign-in
    const isPublic = publicPaths.some(path => pathname.startsWith(path)) || pathname === '/'
    if (!isPublic) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }


  // Refresh session and return the response
  return response
}
