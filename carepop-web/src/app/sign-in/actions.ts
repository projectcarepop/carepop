'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const cookieStore = await cookies()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // We are redirecting back to the sign-in page with an error message
    // in the URL query string.
    return redirect(`/sign-in?message=${encodeURIComponent(error.message)}`)
  }

  // A successful sign-in will be handled by the middleware,
  // which will redirect the user to the appropriate page.
  // We just need to refresh the page to trigger the middleware.
  return redirect('/main-dashboard')
}

export async function googleSignIn() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    });

    if (error) {
        return redirect(`/sign-in?message=${encodeURIComponent(error.message)}`);
    }

    if (data.url) {
        return redirect(data.url); // Redirect the user to the Google authentication page.
    }

    // If for some reason the URL is not available, redirect back with a generic error.
    return redirect('/sign-in?message=Could not authenticate with Google.');
} 