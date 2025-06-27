import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CreateProfileForm } from '@/components/create-profile/CreateProfileForm';
import type { Profile } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';

// This line tells Next.js to always render this page on-demand,
// which is necessary because it uses dynamic functions like `cookies` and `searchParams`.
export const dynamic = 'force-dynamic';

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

    if (!res.ok && res.status !== 404) {
      console.error(`Failed to fetch profile, status: ${res.status}`);
      return { session, profile: null };
    }
    
    const profile = (res.ok && res.status !== 204) ? await res.json() : null;
    return { session, profile };

  } catch (error) {
    console.error("Failed to fetch initial profile for editing:", error);
    return { session, profile: null };
  }
}

export default async function CreateProfilePage({ searchParams }: { searchParams: { mode?: string } }) {
  const { session, profile } = await getInitialProfile();
  
  const isEditMode = searchParams?.mode === 'edit';

  if (!session) {
    return redirect('/sign-in');
  }

  if (profile && !isEditMode) {
    return redirect('/main-dashboard');
  }

  return (
    <main className="container mx-auto py-12">
      <div className="flex justify-center">
        <CreateProfileForm initialProfile={profile} />
      </div>
    </main>
  );
}