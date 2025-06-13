import { supabase } from '../../lib/supabase/client';
import { z } from 'zod';
import type { signUpSchema, resetPasswordSchema } from '../../validation/public/auth.validation';

type SignUpInput = z.infer<typeof signUpSchema>['body'];
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];

// Helper to get user profile and roles
const getFullUser = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (profileError) throw profileError;

    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', userId);

    if (rolesError) throw rolesError;

    // The roles query returns an array of objects like [{ roles: { name: 'User' } }]
    // We flatten this into a simple array of strings: ['User']
    const roleNames = roles?.map(r => (r.roles as any).name) || [];

    return { ...profile, roles: roleNames };
};

export const authService = {
    signUp: async (input: SignUpInput) => {
        const { email, password } = input;

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Set to true to require email verification
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('User creation failed in Supabase.');
        
        const userId = authData.user.id;

        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ user_id: userId, first_name: '', last_name: '', email });

        if (profileError) {
            // If profile creation fails, we should delete the auth user to prevent orphaned users.
            await supabase.auth.admin.deleteUser(userId);
            throw new Error(profileError.message);
        }
        
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'User')
            .single();

        if (roleError || !roleData) throw roleError || new Error('Default "User" role not found.');

        const { error: userRoleError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role_id: roleData.id });

        if (userRoleError) {
             await supabase.auth.admin.deleteUser(userId);
             throw new Error(userRoleError.message);
        }

        return { message: 'Sign up successful. Please check your email to complete registration.' };
    },

    login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) throw new Error(error?.message || 'Login failed.');

        const user = await getFullUser(data.user.id);
        return { session: data.session, user };
    },

    loginWithGoogle: async (code: string) => {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.user) throw new Error(error?.message || 'Google login failed.');
        
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', data.user.id).single();
        
        if (!profile) {
            const { id, email, user_metadata } = data.user;
            await supabase.from('profiles').insert({ 
                user_id: id, 
                email, 
                first_name: user_metadata.given_name || 'Google',
                last_name: user_metadata.family_name || 'User',
                avatar_url: user_metadata.avatar_url,
            });

            const { data: roleData } = await supabase.from('roles').select('id').eq('name', 'User').single();
            if (roleData) {
                await supabase.from('user_roles').insert({ user_id: id, role_id: roleData.id });
            }
        }
        
        const user = await getFullUser(data.user.id);
        return { session: data.session, user };
    },

    forgotPassword: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/auth/update-password',
        });
        if (error) throw new Error(error.message);
        return { message: 'Password reset email sent.' };
    },

    resetPassword: async (input: ResetPasswordInput) => {
        const { token, password } = input;
        
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(token);
        if (sessionError || !sessionData.user) throw sessionError || new Error('Invalid or expired password reset token.');

        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw new Error(updateError.message);
        
        return { message: 'Password has been reset successfully.' };
    }
}; 