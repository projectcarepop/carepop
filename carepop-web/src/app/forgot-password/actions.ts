'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return redirect('/forgot-password?message=Email address is required')
  }

  try {
    const cookieStore = await cookies()
    const headersList = await headers()
    const supabase = createClient(cookieStore)

    // Get the site URL from headers or environment variable with fallback
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`

    console.log('Attempting password reset for email:', email)
    console.log('Using site URL:', siteUrl)

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
    })

    if (error) {
      console.error('Password reset error:', error)
      return redirect(`/forgot-password?message=${encodeURIComponent(`Error sending recovery email: ${error.message}`)}`)
    }

    console.log('Password reset email sent successfully:', data)
    return redirect('/forgot-password?message=Password reset link has been sent to your email.')
    
  } catch (err) {
    console.error('Unexpected error during password reset:', err)
    return redirect('/forgot-password?message=An unexpected error occurred. Please try again.')
  }
} 