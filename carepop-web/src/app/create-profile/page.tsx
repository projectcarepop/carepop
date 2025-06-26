import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CreateProfileForm } from '@/components/create-profile/CreateProfileForm';
import type { Profile } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';

// This function securely fetches the session and any existing profile data.
async function getInitialProfile(): Promise<{ session: Session | null, profile: Profile | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { session: null, profile: null };
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error("API URL is not configured.");
    }
    const headers = { 'Authorization': `Bearer ${session.access_token}` };
    const res = await fetch(`${apiUrl}/api/me/profile`, { headers, cache: 'no-store' });

    // A 404 is not an error in this context; it just means the profile doesn't exist yet.
    if (!res.ok && res.status !== 404) {
      console.error(`Failed to fetch profile, status: ${res.status}`);
      return { session, profile: null };
    }
    
    // If the profile doesn't exist (404), res.json() will fail, so we handle that.
    const profile = res.ok ? await res.json() : null;
    return { session, profile };

  } catch (error) {
    console.error("Failed to fetch initial profile for editing:", error);
    return { session, profile: null };
  }
}

export default async function CreateProfilePage({ searchParams }: { searchParams: { mode?: string } }) {
  console.log("--- CREATE PROFILE PAGE ---");
  console.log("Received searchParams:", searchParams);
  console.log("Value of searchParams.mode:", searchParams.mode);
  console.log("Is mode !== 'edit'?", searchParams.mode !== 'edit');

  const { session, profile } = await getInitialProfile();

  // This is the ONLY security check this page needs.
  // If the user is not logged in, send them to the sign-in page.
  if (!session) {
    return redirect('/sign-in');
  }

  // However, if the user *is* logged in and *has* a profile, but is NOT in "edit" mode,
  // we can assume they ended up here by mistake. In this case, send them to the dashboard.
  console.log("Checking redirect condition...");
  if (profile && searchParams.mode !== 'edit') {
    console.log("CONDITION MET - REDIRECTING NOW");
    return redirect('/main-dashboard');
  }

  // The user is logged in. Now, we render the form.
  // We pass the profile data (even if it's null or partial) to the form.
  // The form component itself will handle pre-populating fields.
  return (
    <main className="container mx-auto py-12">
      <div className="flex justify-center">
        <CreateProfileForm initialProfile={profile} />
      </div>
    </main>
  );
} 