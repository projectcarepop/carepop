import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - data/ (data files)
     * - auth/.* (authentication paths)
     * - sign-in, sign-up, forgot-password, update-password, /, about, contact, privacy-policy, terms-of-service, all-clinics, clinic-finder, find-a-clinic, professionals, services, download-app
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|data/|auth/.*|sign-in|sign-up|forgot-password|update-password|/|about|contact|privacy-policy|terms-of-service|all-clinics|clinic-finder|find-a-clinic|professionals|services|download-app|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 