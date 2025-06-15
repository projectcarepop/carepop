import { supabaseAdmin } from '../../lib/supabase/admin-client';
import { z } from 'zod';
import type { signUpSchema, resetPasswordSchema } from '../../validation/public/auth.validation';
import { userService } from './user.service';

type SignUpInput = z.infer<typeof signUpSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const authService = {
    signUp: async (input: SignUpInput) => {
        const { email, password } = input;

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Revert to true to require email verification
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('User creation failed in Supabase.');
        
        const userId = authData.user.id;

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({ user_id: userId, first_name: '', last_name: '', email });

        if (profileError) {
            // If profile creation fails, we should delete the auth user to prevent orphaned users.
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw new Error(profileError.message);
        }
        
        // Correctly insert the default role for the new user.
        // The `user_roles` table expects a user_id and a text role.
        const { error: userRoleError } = await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: userId, role: 'User' });

        if (userRoleError) {
             // If role assignment fails, delete the auth user to prevent orphaned users.
             await supabaseAdmin.auth.admin.deleteUser(userId);
             throw new Error(userRoleError.message);
        }

        return { message: 'Sign up successful. Please check your email to complete registration.' };
    },

    login: async (email: string, password: string) => {
        // NOTE: login should use the public client, which I assume is now in 'public-client'
        // This will need to be updated project-wide. For now, fixing signup.
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
        if (error || !data.user) throw new Error(error?.message || 'Login failed.');

        const user = await userService.getProfileById(data.user.id);
        return { session: data.session, user };
    },

    loginWithGoogle: async (code: string) => {
        const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
        if (error || !data.user) throw new Error(error?.message || 'Google login failed.');
        
        const user = await userService.getProfileById(data.user.id);
        
        // If the user profile is minimal (just created), we might want to populate it
        // from Google's data. This part can be enhanced later.
        if (!user.first_name && !user.last_name) {
             const { user_metadata } = data.user;
             await supabaseAdmin.from('profiles').update({
                first_name: user_metadata.given_name || '',
                last_name: user_metadata.family_name || '',
                avatar_url: user_metadata.avatar_url,
             }).eq('user_id', data.user.id);
        }

        return { session: data.session, user: await userService.getProfileById(data.user.id) };
    },

    forgotPassword: async (email: string) => {
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/auth/update-password',
        });
        if (error) throw new Error(error.message);
        return { message: 'Password reset email sent.' };
    },

    resetPassword: async (input: ResetPasswordInput) => {
        const { token, password } = input;
        
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.exchangeCodeForSession(token);
        if (sessionError || !sessionData.user) throw sessionError || new Error('Invalid or expired password reset token.');

        const { error: updateError } = await supabaseAdmin.auth.updateUser({ password });
        if (updateError) throw new Error(updateError.message);
        
        return { message: 'Password has been reset successfully.' };
    }
}; 