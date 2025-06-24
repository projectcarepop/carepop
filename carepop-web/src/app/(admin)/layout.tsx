import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { type UserProfile } from '@/types/app';
import { AdminSidebar } from '@/components/admin-dashboard/AdminSidebar';

// This helper function fetches the user's full profile from our API,
// which is necessary to check for the 'admin' role.
async function getAdminProfile(accessToken: string): Promise<UserProfile | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.error('FATAL: NEXT_PUBLIC_API_URL is not configured.');
        return null;
    }
    const res = await fetch(`${apiUrl}/api/me/profile`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        cache: 'no-store',
    });

    if (!res.ok) {
        // This could be a 404 if the profile isn't created, or another error.
        // In either case, they are not a valid admin.
        return null;
    }
    const data = await res.json();
    return data.data as UserProfile;
}


export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { session } } = await supabase.auth.getSession();

    // --- 1. Primary Security Check: Session ---
    // If there's no session, they are not logged in. Redirect to sign-in.
    if (!session) {
        return redirect('/sign-in');
    }

    // --- 2. Secondary Security Check: Admin Role ---
    // Fetch the full profile from our backend to check the role.
    const userProfile = await getAdminProfile(session.access_token);

    // If the profile doesn't exist or the role is not 'admin', redirect.
    if (userProfile?.role !== 'admin') {
        // Redirect non-admins to the home page or a 'forbidden' page.
        return redirect('/'); 
    }

    // --- 3. Render Admin Layout ---
    // If all checks pass, render the layout with the persistent sidebar.
    return (
        <div className="flex min-h-screen bg-muted/40">
            <AdminSidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
} 