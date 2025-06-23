import { auth } from '@clerk/nextjs/server';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function getAuthToken(): Promise<string | null> {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
} 

/**
 * Retrieves the user ID from the server-side authentication context.
 * Useful for server actions and route handlers to securely get the current user's ID.
 * @returns The user's ID string, or null if not authenticated.
 */
export async function getUserId(): Promise<string | null> {
    const { userId } = await auth();
    return userId;
} 