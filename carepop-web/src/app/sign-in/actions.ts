'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const cookieStore = await cookies()
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

  // After successful sign-in, check the user's role to redirect them correctly.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (profile?.role === 'admin') {
        return redirect('/admin');
    }
  }

  // For non-admin users or if the profile isn't found, redirect to the main dashboard.
  return redirect('/main-dashboard')
}

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  return redirect('/')
}

export async function googleSignIn() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
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