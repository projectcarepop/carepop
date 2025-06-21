import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Pass the current request cookies so the Supabase helper can set
    // the auth cookies after exchanging the OAuth code. Without this
    // the session is not persisted and login appears to fail.
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${origin}/login?error=Could not process authentication event.`
  )
} 