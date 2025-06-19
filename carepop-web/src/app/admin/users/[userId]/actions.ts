'use server';

import { createClient as createActionClient } from '@/utils/supabase/server';
import { createPageServerClient } from '@/lib/supabase/page-server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getUserDetails(userId: string) {
  const supabase = await createPageServerClient();

  const { data: profile } = await supabase
    .from('users_view')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { profile: null };
  }

  return { profile };
}

export async function updateUserRole(userId: string, newRole: string) {
    const cookieStore = cookies();
    const supabase = createActionClient(cookieStore);
  
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

    } catch {
        return { success: false, message: 'An unexpected error occurred.' };
    }
} 