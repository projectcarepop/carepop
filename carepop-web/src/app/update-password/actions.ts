'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function updateUserPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validation
  if (!password || !confirmPassword) {
    return redirect('/update-password?message=Please fill in all fields')
  }

  if (password !== confirmPassword) {
    return redirect('/update-password?message=Passwords do not match')
  }

  if (password.length < 6) {
    return redirect('/update-password?message=Password must be at least 6 characters long')
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User not authenticated for password update:', userError)
      return redirect('/sign-in?message=Please sign in to update your password')
    }

    console.log('Updating password for user:', user.id)

    const { data, error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('Password update error:', error)
      return redirect(`/update-password?message=${encodeURIComponent(error.message)}`)
    }

    console.log('Password updated successfully:', data)
    return redirect('/sign-in?message=Your password has been updated successfully. Please sign in.')
    
  } catch (err) {
    console.error('Unexpected error during password update:', err)
    return redirect('/update-password?message=An unexpected error occurred. Please try again.')
  }
} 