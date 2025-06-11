import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Define a type for the user object we expect in the session cookie
interface UserProfile {
  roles?: string[];
}

interface StoredSession {
    user?: UserProfile;
}

const adminPaths = [
  '/admin/appointments',
  '/admin/clinics',
  '/admin/inventory',
  '/admin/providers',
  '/admin/service-categories',
  '/admin/services',
  '/admin/users',
  '/admin/suppliers',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the user is trying to access the root admin page or any of its sub-pages
  if (pathname === '/admin' || adminPaths.some(path => pathname.startsWith(path))) {
    const sessionCookie = request.cookies.get('session')

    if (sessionCookie) {
      try {
        const sessionData: StoredSession = JSON.parse(sessionCookie.value)
        const isAdmin = sessionData.user?.roles?.includes('Admin')

        if (!isAdmin) {
          // If not an admin, redirect to the forbidden page
          return NextResponse.redirect(new URL('/forbidden', request.url))
        }
      } catch (error) {
        // If the cookie is malformed or something goes wrong, redirect to login
        console.error('Error parsing session cookie in middleware:', error)
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } else {
      // If there's no session cookie, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // For all other routes, or for admins passing the check, just update the session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 