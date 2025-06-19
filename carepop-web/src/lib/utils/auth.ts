import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function getAuthToken(): Promise<string | null> {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
} 