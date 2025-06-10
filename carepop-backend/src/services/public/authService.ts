import { supabase } from '@/lib/supabase/client';
import { AppError } from '@/lib/utils/appError';
import { PostgrestError } from '@supabase/supabase-js';
import { z } from 'zod';
import { loginSchema, signUpSchema } from '@/validation/public/authValidation';
import { UserService } from './userService';
import { StatusCodes } from 'http-status-codes';

// Infer types from Zod schemas
type TSignUpCredentials = z.infer<typeof signUpSchema>;
type TSignInCredentials = z.infer<typeof loginSchema>;

export class AuthService {
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      throw new AppError(error.message, StatusCodes.BAD_REQUEST);
    }
    if (!data.user || !data.session) {
      throw new AppError('Sign up failed, user or session not returned', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // The handle_new_user trigger in Supabase should have created a profile.
    // We might need to assign a default role here if not handled by a trigger.
    // For now, we assume the trigger setup is sufficient for profile and basic role.

    return { user: data.user, session: data.session };
  }

  async login(email: string, password: string) {
    // 1. Authenticate user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new AppError(authError.message || 'Invalid credentials', StatusCodes.UNAUTHORIZED);
    }
    if (!authData.user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    const userId = authData.user.id;

    // 2. Fetch user profile and role in parallel
    const [profileResponse, roleResponse] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('user_id', userId).single(),
      supabase.from('user_roles').select('role').eq('user_id', userId).single(),
    ]);

    const { data: profile, error: profileError } = profileResponse;
    if (profileError) {
        // Log the error for debugging but don't fail the login if profile is just missing
        console.error('Profile fetch error:', (profileError as PostgrestError).message);
    }
    
    const { data: roleData, error: roleError } = roleResponse;
    if (roleError) {
        // Log the error but default to a 'user' role if not found
        console.error('Role fetch error:', (roleError as PostgrestError).message);
    }
    
    const userRole = roleData?.role || 'user'; // Default role

    const enrichedUser = {
      id: authData.user.id,
      email: authData.user.email,
      full_name: profile?.full_name || `${authData.user.user_metadata.first_name || ''} ${authData.user.user_metadata.last_name || ''}`.trim(),
    };

    return {
      user: enrichedUser,
      session: authData.session,
      role: userRole,
    };
  }
} 