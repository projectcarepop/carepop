import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/app/admin/_components/AdminSideBar';
import { AdminProvider } from '@/lib/contexts/AdminContext';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Use the recommended getUser() for a secure, server-validated check.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This is the most reliable way to check for an active user.
    return redirect('/sign-in?redirect=/admin');
  }

  // 2. Fetch the user's profile from our database to check their role.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // --- START ENHANCED DEBUG LOGGING ---
  console.log('--- Admin Layout Auth Check ---');
  console.log('[User Object from JWT]:', JSON.stringify(user, null, 2));
  console.log('[Profile from DB]:', JSON.stringify(profile, null, 2));
  if (profileError) {
    console.error('[Profile Fetch Error]:', JSON.stringify(profileError, null, 2));
  }
  console.log('--- End Admin Layout Auth Check ---');
  // --- END ENHANCED DEBUG LOGGING ---
  
  if (profileError || profile?.role !== 'admin') {
    // If there's an error fetching the profile or the role is not admin, redirect.
    console.log(`Redirecting to /forbidden. Reason: ${profileError ? 'Profile Error' : `Role is not admin, it is '${profile?.role}'`}`);
    return redirect('/forbidden');
  }

  // If all checks pass, render the layout.
  return (
    <AdminProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </AdminProvider>
  );
}