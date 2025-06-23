import { supabaseAdmin } from "@/lib/supabase/admin";
import 'server-only';

async function getUnlinkedProfiles() {
    // An unlinked profile is one whose clerk_id does NOT exist in the
    // providers table's profile_id column.
    const { data: providers, error: providersError } = await supabaseAdmin
        .from('providers')
        .select('profile_id')
        .filter('profile_id', 'is', 'not.null');

    if (providersError) {
        console.error("Error fetching linked provider profiles:", providersError);
        return [];
    }

    const linkedProfileIds = providers.map(p => p.profile_id);

    const { data: unlinkedProfiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('clerk_id, first_name, last_name')
        .not('clerk_id', 'in', `(${linkedProfileIds.join(',')})`);

    if (profilesError) {
        console.error("Error fetching unlinked profiles:", profilesError);
        return [];
    }

    return unlinkedProfiles.map(p => ({
        id: p.clerk_id,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
    }));
}

export const profilesService = {
  getUnlinkedProfiles,
}; 