import { supabase } from '../../lib/supabase/client';

const getFullUser = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (profileError) throw new Error('User profile not found.');

    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', userId);

    if (rolesError) throw rolesError;

    const roleNames = roles?.map(r => (r.roles as any).name) || [];

    return { ...profile, roles: roleNames };
};


export const userService = {
    getProfileById: async (userId: string) => {
        return await getFullUser(userId);
    },
}; 