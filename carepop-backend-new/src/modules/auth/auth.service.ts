// src/modules/auth/auth.service.ts

// This file will contain the business logic for user registration,
// login, session management, etc.

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../lib/supabase';
import { registerUserSchema, loginUserSchema } from './auth.validation';
import { emailService } from '../../lib/email';
import { env } from '../../config';
import { ApiError } from '../../lib/errors';

type RegisterUserInput = z.infer<typeof registerUserSchema>;
type LoginUserInput = z.infer<typeof loginUserSchema>;

// Create a service-specific public Supabase client
// This avoids passing the client down from the routes and middleware
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// The supabase client is no longer passed in from the middleware
async function registerUser(input: RegisterUserInput) {
  const { email, password } = input;

  // Step 1: Create the user in Supabase Auth. The on_auth_user_created trigger
  // will now handle creating the profile and assigning the role.
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // This is crucial. It tells Supabase where to send the user after they click the confirmation link.
      emailRedirectTo: `${env.WEB_APP_URL}/auth/email-confirmed`,
    },
  });

  if (signUpError) {
    throw new ApiError(400, signUpError.message);
  }

  if (!authData.user) {
    throw new ApiError(500, 'User not found after registration.');
  }

  // The trigger now handles profile and role creation, so no further action is needed here.
  // We can still send a welcome email if desired.
  emailService
    .sendEmail({
      to: email,
      subject: 'Welcome to CarePoP! 🎉',
      html: '<h1>Welcome!</h1><p>Thank you for registering with CarePoP.</p>',
    })
    .catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

  return authData;
}

async function loginUser(input: LoginUserInput) {
  const { email, password } = input;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Let the global error handler catch and format this
    throw error;
  }

  return data;
}

async function logoutUser() {
  // Here we can use the admin client if we need to perform cleanup,
  // but for just signing out, the regular client is fine as it will
  // use the user's JWT from the request to invalidate the correct session.
  return supabase.auth.signOut();
}

export const authService = {
  registerUser,
  loginUser,
  logoutUser,
}; 