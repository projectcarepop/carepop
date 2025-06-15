import { supabase } from '../../lib/supabase/public-client';
import { supabaseAdmin } from '../../lib/supabase/admin-client';
import { AppError } from '@/lib/utils/appError';

const getFullUser = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (profileError || !profile) {
        throw new AppError('User profile not found.', 404);
    }

    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

    if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
    }
    
    const roleNames = roles?.map((r: { role: string }) => r.role) || [];

    return { ...profile, roles: roleNames };
};


export const userService = {
    getProfileById: async (userId: string) => {
        const user = await getFullUser(userId);
        if (!user) {
            throw new AppError('User profile not found.', 404);
        }
        return user;
    },

    updateProfile: async (userId: string, profileData: any) => {
        // Ensure user_id from token is used, not whatever is in the body.
        const dataToUpdate = { ...profileData, user_id: userId };

        // We don't want to allow updating the user_id, email, or role from this endpoint.
        delete dataToUpdate.id;
        delete dataToUpdate.email;
        delete dataToUpdate.roles;
        delete dataToUpdate.created_at;
        delete dataToUpdate.updated_at;

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(dataToUpdate)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw new AppError(error.message, 500);
        }

        if (!data) {
            throw new AppError('Profile not found for update.', 404);
        }

        return data;
    }
}; 