import { supabase } from '../../lib/supabase/public-client';
import { supabaseAdmin } from '../../lib/supabase/admin-client';
import { z } from 'zod';
import type { signUpSchema, resetPasswordSchema } from '../../validation/public/auth.validation';
import { userService } from './user.service';

type SignUpInput = z.infer<typeof signUpSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const authService = {
    signUp: async (input: SignUpInput) => {
        const { email, password } = input;

        // Step 1: Use the PUBLIC client to sign up the user.
        // This respects the project's email confirmation setting.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `http://localhost:3001/auth/email-confirmed`,
            }
        });

        if (authError) {
            // Forward the original error from Supabase
            throw new Error(authError.message);
        }
        if (!authData.user) {
            throw new Error('User creation failed: no user data returned.');
        }

        const userId = authData.user.id;

        // Step 2: Use the ADMIN client for privileged operations.
        // Insert into the 'profiles' table.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({ user_id: userId, first_name: '', last_name: '', email });

        if (profileError) {
            // If profile creation fails, we must delete the auth user to prevent orphans.
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw new Error(`Failed to create profile: ${profileError.message}`);
        }
        
        // Step 3: Use the ADMIN client to assign the default role.
        const { error: userRoleError } = await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: userId, role: 'user' });

        if (userRoleError) {
             // If role assignment fails, delete the auth user and profile to clean up.
             await supabaseAdmin.auth.admin.deleteUser(userId);
             // The profile has a foreign key to the user, so it should cascade or be deleted.
             throw new Error(`Failed to assign user role: ${userRoleError.message}`);
        }

        return { message: 'Sign up successful. Please check your email to complete registration.' };
    },

    login: async (email: string, password: string) => {
        // Correctly use the public client for login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) throw new Error(error?.message || 'Login failed.');

        // Use the admin client to fetch profile data, as RLS might prevent the user from seeing it
        // immediately after login if there are policies in place.
        const user = await userService.getProfileById(data.user.id);
        return { session: data.session, user };
    },

    loginWithGoogle: async (code: string) => {
        // Exchange code should use the public client
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.user) throw new Error(error?.message || 'Google login failed.');
        
        const user = await userService.getProfileById(data.user.id);
        
        if (!user.first_name && !user.last_name) {
             const { user_metadata } = data.user;
             // Use the ADMIN client to update the profile
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
            redirectTo: 'https://www.carepop.com/auth/update-password',
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