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
    
    console.log('Attempting to upsert profile with data:', JSON.stringify(profileData, null, 2));

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData, { onConflict: 'clerk_id' });

    if (error) {
        console.error('Webhook profile upsert database error:', error);
        throw new ApiError(500, `Error upserting profile via webhook: ${error.message}`);
    }
    
    console.log('Successfully upserted profile data:', data);
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
    if (event.type !== 'user.created' && event.type !== 'user.updated') {
        console.log(`Received and ignored unhandled event type: ${event.type}`);
        return; // Exit early for unhandled events
    }
    
    console.log(`Processing ${event.type} for user ${event.data.id}`);
    
    try {
        const userData = event.data;

        // Step 1: Always upsert the profile first. This is the primary record.
        const profile = await upsertProfile(userData);
        console.log(`Successfully upserted profile for user ${userData.id}`);

        // Step 2: Now that we know the profile exists, upsert the role.
        const role = (userData.public_metadata?.role as 'admin' | 'user') || 'user';
        await upsertUserRole(userData.id, role);
        console.log(`Successfully upserted role for user ${userData.id}`);

        console.log(`Fully processed ${event.type} for user ${userData.id}`);

    } catch (error) {
        // Log the specific error that occurred during the process.
        console.error(`Error processing webhook for user ${event.data.id}:`, error);
        // It's often better to not re-throw here, to prevent Clerk from retrying
        // a webhook that might be fundamentally broken. Instead, we rely on logs.
    }
} 