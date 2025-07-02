import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // The page to redirect to after signing in
  const next = searchParams.get('next') ?? '/main-dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    // This exchanges the code for a session and automatically sets the cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page if something went wrong
  console.error('Error in auth callback: No code found or exchange failed.')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}