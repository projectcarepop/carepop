'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function updateUserPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return redirect('/update-password?message=Passwords do not match')
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return redirect(`/update-password?message=${encodeURIComponent(error.message)}`)
  }

  return redirect('/sign-in?message=Your password has been updated successfully. Please sign in.')
} 