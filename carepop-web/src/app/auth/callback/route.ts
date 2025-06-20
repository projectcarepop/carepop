import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redirect to a page that confirms the email has been verified
      return NextResponse.redirect(`${origin}/auth/email-confirmed`);
    }
  }

  // If there's an error or no code, redirect to the login page.
  // In the future, we could add error messages to the query params.
  console.error('ERROR: Could not exchange code for session in auth callback.');
  return NextResponse.redirect(`${origin}/login`);
} 