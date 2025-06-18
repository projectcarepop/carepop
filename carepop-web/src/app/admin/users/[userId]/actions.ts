'use server';

import { createClient as createActionClient } from '@/utils/supabase/server';
import { createPageServerClient } from '@/lib/supabase/page-server';
import { revalidatePath } from 'next/cache';

export async function getUserDetails(userId: string) {
  const supabase = await createPageServerClient();

  const { data: profile, error } = await supabase
    .from('users_view')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return { profile: null };
  }

  return { profile };
}

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = createActionClient();
  
    // We need an authenticated user session to make admin API calls,
    // but this server action is initiated by an admin who is already logged in.
    // The server-side Supabase client handles passing the auth context.
    // However, for calling our OWN backend, we need the token.
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return { success: false, message: 'Not authenticated' };
    }

    // The base URL should be in an environment variable, but for now, we'll construct it.
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

    try {
        const response = await fetch(`${backendUrl}/api/v1/admin/users/${userId}/roles`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ roles: [newRole] }), // Backend expects an array of roles
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, message: errorData.message || 'Failed to update role.' };
        }

        revalidatePath(`/admin/users/${userId}`);
        return { success: true, message: 'User role updated successfully.' };

    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
} 