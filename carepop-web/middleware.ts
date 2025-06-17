import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // This function will also refresh the session cookie
  const { supabase, response } = createClient(request);

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If authenticated, perform a server-side check for the admin role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    // If there's an error, or the profile doesn't exist, or the role is not admin, deny access.
    if (error || !profile || profile.role !== 'admin') {
      // Redirect to a generic 'forbidden' page
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }

  // For all other routes, or for admins who passed the check, continue with the response.
  return response;
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
};