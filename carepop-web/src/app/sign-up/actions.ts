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

    console.log('Signup response:', { data, error })

    if (error) {
      console.error('Signup error:', error)
      return redirect(`/sign-up?message=${encodeURIComponent(error.message)}`)
    }

    // Even if there's no error, check if user was created or if email needs confirmation
    if (data.user) {
      console.log('Signup initiated successfully for user:', data.user.id)
      return redirect('/sign-up?success=true')
    } else {
      console.log('Signup response received but no user object')
      return redirect('/sign-up?success=true') // Still consider it success if no error
    }
    
  } catch (err) {
    console.error('Unexpected error during signup:', err)
    return redirect('/sign-up?message=An unexpected error occurred. Please try again.')
  }
} 