import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin-dashboard/AdminSidebar';

// This is a placeholder type. You should define this in a central types file.
// For example, src/lib/types/app.ts
type UserProfile = {
  id: string;
  role: string;
  // ... other profile properties
};

async function getAdminProfile(accessToken: string): Promise<UserProfile | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.error('FATAL: NEXT_PUBLIC_API_URL is not configured.');
        return null;
    }
    const res = await fetch(`${apiUrl}/api/me/profile`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        cache: 'no-store', // Always check the role
    });

    if (!res.ok) {
        return null;
    }
    // The API returns the profile directly, not nested under 'data'
    return res.json();
}


export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // 1. Check for authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/sign-in?redirect=/admin-dashboard');
    }

    // 2. Check for session to get access token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return redirect('/sign-in?error=session_not_found');
    }
    
    // 3. Verify the user has an 'admin' role by calling our backend
    const userProfile = await getAdminProfile(session.access_token);

    if (userProfile?.role !== 'admin') {
        // Redirect non-admins to a 'forbidden' page or the home page
        return redirect('/forbidden'); 
    }

    // If all checks pass, render the admin layout
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 