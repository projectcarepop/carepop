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

  // Step 1: Create the user in Supabase Auth
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

  // Step 2: Use the admin client to create the profile and assign a role.
  // This is the defined pattern for the new Hono backend.
  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({ id: userId });

  if (profileError) {
    // In a real-world scenario, you might want to clean up the created auth user here.
    console.error('Failed to create profile for user:', userId, profileError);
    throw new ApiError(
      500,
      'User was created successfully, but failed to create a profile.'
    );
  }
  
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .insert({ user_id: userId, role: 'user' });

  if (roleError) {
    // In a real-world scenario, you might want to clean up the created auth user here.
    console.error('Failed to assign role to user:', userId, roleError);
    throw new ApiError(
      500,
      'User was created successfully, but failed to assign a user role.'
    );
  }

  // Step 3: Send a welcome email using our custom email service.
  try {
    await emailService.sendEmail({
      to: email,
      subject: 'Welcome to CarePoP!',
      html: '<h1>Welcome!</h1><p>Thank you for registering.</p>',
    });
  } catch (emailError) {
    // Log the error but don't block the user's registration.
    // Email delivery is secondary to account creation.
    console.error('Failed to send welcome email:', emailError);
  }

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