import { supabase, supabaseServiceRole } from '@/config/supabaseClient';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { registerUserSchema, loginUserSchema } from '@/validation/auth.validation';
import { z } from 'zod';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

type RegisterInput = z.infer<typeof registerUserSchema>;
type LoginInput = z.infer<typeof loginUserSchema>;

export const registerUserService = async (
  userData: RegisterInput
): Promise<{ success: boolean; user?: User | null; message?: string; error?: AuthError | null }> => {
  const { email, password } = userData;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error, message: error.message };
  }
  
  if (!data.user) {
    return { success: false, message: 'Registration successful, but no user data returned.' };
  }

  // The trigger will handle profile creation.
  
  return { success: true, user: data.user, message: 'Registration successful. Please check your email to confirm.' };
};

export const loginUserService = async (
  loginData: LoginInput
): Promise<{ success: boolean; user?: User | null; session?: Session | null; message?: string; error?: AuthError | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword(loginData);

  if (error) {
    return { success: false, message: error.message, error };
  }

  return { success: true, user: data.user, session: data.session, message: 'Login successful' };
}; 