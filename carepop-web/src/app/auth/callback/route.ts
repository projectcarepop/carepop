import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // The page to redirect to after signing in
  const next = searchParams.get('next') ?? '/main-dashboard'

  console.log('Auth callback called with:', {
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    origin,
    next
  })

  // Check if there's an OAuth error from the provider
  if (error) {
    console.error('OAuth provider error:', { error, errorDescription })
    const errorUrl = new URL('/auth/auth-code-error', origin)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('description', errorDescription)
    }
    return NextResponse.redirect(errorUrl.toString())
  }

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)
      
      // This exchanges the code for a session and automatically sets the cookie
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        const errorUrl = new URL('/auth/auth-code-error', origin)
        errorUrl.searchParams.set('error', 'exchange_failed')
        errorUrl.searchParams.set('description', exchangeError.message)
        return NextResponse.redirect(errorUrl.toString())
      }
      
             if (data.session) {
         console.log('Session exchange successful, redirecting to:', next)
         
         // Special handling for password reset flow
         if (next === '/update-password') {
           console.log('Password reset session detected, redirecting to update password')
         }
         
         return NextResponse.redirect(`${origin}${next}`)
       }
    } catch (err) {
      console.error('Unexpected error during code exchange:', err)
      const errorUrl = new URL('/auth/auth-code-error', origin)
      errorUrl.searchParams.set('error', 'unexpected_error')
      errorUrl.searchParams.set('description', 'An unexpected error occurred during authentication')
      return NextResponse.redirect(errorUrl.toString())
    }
  }

  // No code and no error - invalid callback
  console.error('Auth callback called without code or error parameters')
  const errorUrl = new URL('/auth/auth-code-error', origin)
  errorUrl.searchParams.set('error', 'missing_code')
  errorUrl.searchParams.set('description', 'Authentication callback was called without required parameters')
  return NextResponse.redirect(errorUrl.toString())
}