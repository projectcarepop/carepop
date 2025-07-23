'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return redirect('/sign-up?message=Email and password are required')
  }

  try {
    const cookieStore = await cookies()
    const headersList = await headers()
    const supabase = createClient(cookieStore)

    // Get the site URL from headers or environment variable with fallback (same as forgot password)
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`

    console.log('Attempting signup for email:', email)
    console.log('Using site URL:', siteUrl)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/auth/email-verified`,
      },
    })

    if (error) {
      console.error('Signup error:', error)
      return redirect(`/sign-up?message=${encodeURIComponent(error.message)}`)
    }

    console.log('Signup initiated successfully:', data)
    return redirect('/sign-up?success=true')
    
  } catch (err) {
    console.error('Unexpected error during signup:', err)
    return redirect('/sign-up?message=An unexpected error occurred. Please try again.')
  }
} 