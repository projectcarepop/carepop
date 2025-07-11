import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // The rest of the logic for redirecting users based on auth state.
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const publicPaths = ['/', '/about', '/contact', '/clinic-finder', '/download-app', '/sign-in', '/sign-up', '/forgot-password', '/update-password', '/auth/callback', '/auth/confirm', '/auth/debug', '/auth/auth-code-error', '/terms-of-service', '/privacy-policy']
  const authPages = ['/sign-in', '/sign-up', '/forgot-password']

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    const hasProfile = !!profile
    if (hasProfile) {
      if (authPages.includes(pathname)) {
        return NextResponse.redirect(new URL('/main-dashboard', request.url))
      }
      if (pathname === '/create-profile' && request.nextUrl.searchParams.get('mode') !== 'edit') {
        return NextResponse.redirect(new URL('/main-dashboard', request.url))
      }
    } else {
      const allowedPaths = ['/create-profile', ...publicPaths];
      if (!allowedPaths.includes(pathname)) {
        return NextResponse.redirect(new URL('/create-profile', request.url))
      }
    }
  } else {
    const isPublic = publicPaths.some(path => pathname.startsWith(path)) || pathname === '/'
    if (!isPublic) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  return response
}