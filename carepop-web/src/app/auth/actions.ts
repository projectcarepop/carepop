'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signOutUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    // Sign out on server side
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }

    // Clear all auth-related cookies manually to ensure clean state
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect even if there's an error to prevent stuck states
  }

  return redirect('/sign-in');
}

 