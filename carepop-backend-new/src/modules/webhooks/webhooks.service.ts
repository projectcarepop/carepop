import { WebhookEvent } from '@clerk/backend';
import { supabaseAdmin } from '../../lib/supabase';
import { ApiError } from '../../lib/errors';

type UserData = {
    id: string;
    email_addresses: { email_address: string; }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string;
    public_metadata: {
        role?: 'admin' | 'user';
    };
};

async function upsertProfile(userData: UserData) {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userData.id,
            email: userData.email_addresses[0]?.email_address,
            first_name: userData.first_name,
            last_name: userData.last_name,
            avatar_url: userData.image_url,
        }, { onConflict: 'id' });

    if (error) {
        throw new ApiError(500, `Error upserting profile: ${error.message}`);
    }
    return data;
}

async function upsertUserRole(userId: string, role: 'admin' | 'user') {
    const { data, error } = await supabaseAdmin
        .from('user_roles')
        .upsert({
            user_id: userId,
            role: role
        }, { onConflict: 'user_id' });

    if (error) {
        throw new ApiError(500, `Error upserting user role: ${error.message}`);
    }
    return data;
}

export async function handleWebhookEvent(event: WebhookEvent) {
    const userData = event.data as UserData;

    switch (event.type) {
        case 'user.created':
        case 'user.updated':
            await upsertProfile(userData);
            const role = userData.public_metadata.role || 'user';
            await upsertUserRole(userData.id, role);
            console.log(`Processed ${event.type} for user ${userData.id}`);
            break;
        default:
            console.log(`Received unhandled event type: ${event.type}`);
    }
} 