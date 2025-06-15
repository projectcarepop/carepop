import { supabase } from '../../lib/supabase/public-client';
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
}; 