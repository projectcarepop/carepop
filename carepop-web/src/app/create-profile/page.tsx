import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CreateProfileForm } from '@/components/create-profile/CreateProfileForm';
import { db } from '@/drizzle/db';
import { profiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * The server component for the Create/Edit Profile page. It handles security,
 * data fetching, and rendering the main form component.
 */
export default async function CreateProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/sign-in');
    }

    // Fetch the user's profile using Drizzle
    const [userProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, user.id));

    // The userProfile can be null if it's their first time.
    // The form component is designed to handle this.
    return (
        <main className="container mx-auto py-12">
            <div className="flex justify-center">
                <CreateProfileForm profile={userProfile || null} />
            </div>
        </main>
    );
} 