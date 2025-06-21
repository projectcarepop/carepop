import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  // If the user is not an admin and is trying to access an admin route, redirect them.
  if (isAdminRoute(req) && sessionClaims?.metadata?.role !== 'admin') {
    const forbiddenUrl = new URL('/forbidden', req.url)
    return NextResponse.redirect(forbiddenUrl)
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};