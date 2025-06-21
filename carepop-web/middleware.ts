import { createClient } from '@/utils/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // This will refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicRoutes = ['/login', '/register', '/forgot-password', '/terms-of-service', '/privacy-policy'];
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  // prevent users from accessing public routes if they are logged in
  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // prevent users from accessing protected routes if they are not logged in
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth (don't run middleware on /auth/callback)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!auth|_next/static|_next/image|favicon.ico).*)',
  ],
}