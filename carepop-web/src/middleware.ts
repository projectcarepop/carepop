import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/forgot-password(.*)']);
const isProfileCompletionRoute = createRouteMatcher(['/complete-profile']);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();

  // If the user is trying to access a protected route but is not logged in, they will be redirected automatically by Clerk.
  
  // After login, check for profile completion
  if (userId && !sessionClaims?.metadata?.profileComplete) {
    // If they are not on the completion page or a public auth page, redirect them.
    if (!isProfileCompletionRoute(req) && !isPublicRoute(req)) {
      const completeProfileUrl = new URL('/complete-profile', req.url);
      return NextResponse.redirect(completeProfileUrl);
    }
  }

  // If the user's profile is complete but they are on the completion page, redirect them.
  if (userId && sessionClaims?.metadata?.profileComplete && isProfileCompletionRoute(req)) {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
  }

  // If the user is not an admin and is trying to access an admin route, redirect them.
  if (isAdminRoute(req) && sessionClaims?.metadata?.role !== 'admin') {
    const forbiddenUrl = new URL('/forbidden', req.url)
    return NextResponse.redirect(forbiddenUrl)
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 