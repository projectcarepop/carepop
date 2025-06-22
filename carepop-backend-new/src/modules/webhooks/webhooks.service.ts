import { WebhookEvent } from '@clerk/backend';
import { supabaseAdmin } from '../../lib/supabase';
import { ApiError } from '../../lib/errors';
import { type UserJSON } from '@clerk/backend';

async function upsertProfile(userData: UserJSON) {
    const metadata = userData.public_metadata || {};
    const profileData = {
        clerk_id: userData.id,
        first_name: (metadata.first_name as string) || userData.first_name,
        last_name: (metadata.last_name as string) || userData.last_name,
        avatar_url: userData.image_url,
        middle_initial: metadata.middle_initial as string,
        date_of_birth: metadata.date_of_birth as string,
        contact_no: metadata.contact_no as string,
        gender_identity: metadata.gender_identity as string,
        pronouns: metadata.pronouns as string,
        assigned_sex_at_birth: metadata.assigned_sex_at_birth as string,
        civil_status: metadata.civil_status as string,
        religion: metadata.religion as string,
        occupation: metadata.occupation as string,
        philhealth_no: metadata.philhealth_no as string,
        street: metadata.street as string,
        province_code: metadata.province_code as string,
        city_municipality_code: metadata.city_municipality_code as string,
        barangay_code: metadata.barangay_code as string,
    };

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData, { onConflict: 'clerk_id' });

    if (error) {
        console.error('Webhook profile upsert error:', error);
        throw new ApiError(500, `Error upserting profile via webhook: ${error.message}`);
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
    if (event.type === 'user.created' || event.type === 'user.updated') {
        const userData = event.data;
        await upsertProfile(userData);

        const role = (userData.public_metadata?.role as 'admin' | 'user') || 'user';
        await upsertUserRole(userData.id, role);
        console.log(`Processed ${event.type} for user ${userData.id}`);
    } else {
        console.log(`Received unhandled event type: ${event.type}`);
    }
} 