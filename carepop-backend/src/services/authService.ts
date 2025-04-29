import { supabase } from '../config/supabaseClient';
import { AuthError, User, Session } from '@supabase/supabase-js';

// Placeholder for user registration logic
// We'll add Supabase interaction here later

// Define a more specific type for the user data if possible, e.g.:
// interface UserRegistrationData {
//   email: string;
//   password: string;
// }

export const registerUserService = async (userData: any): Promise<{ success: boolean; user?: User | null; message?: string; error?: AuthError | null }> => {
  console.log('Attempting to register user with email:', userData?.email);

  // Basic Input Validation
  if (!userData?.email || !userData?.password) {
    console.error('Registration Error: Missing email or password');
    throw new Error('Email and password are required.'); // Throwing a generic error, could be more specific
  }

  const { email, password } = userData;

  // Call Supabase signUp
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    // options: { // Optional: Add additional user metadata or redirect URLs here
    //   data: { 
    //     full_name: 'Example User',
    //   }
    // }
  });

  if (error) {
    console.error('Supabase SignUp Error:', error.message);
    // Return error details for the controller to handle
    // Note: We might want to map Supabase errors to more user-friendly messages later
    return { success: false, error: error, message: error.message };
  }

  if (!data.user) {
    console.error('Supabase SignUp Error: No user data returned despite no error.');
    // Handle the unlikely case where there's no error but also no user data
    return { success: false, message: 'User registration failed for an unknown reason.' };
  }

  // TODO: Potentially create a corresponding profile entry in a 'users' or 'profiles' table here
  // using data.user.id

  console.log('User registered successfully:', data.user.id);
  return { success: true, user: data.user, message: 'User registered successfully. Please check your email for verification.' };
};

// Login User Service
export const loginUserService = async (loginData: any): Promise<{ success: boolean; user?: User | null; session?: Session | null; message?: string; error?: AuthError | null }> => {
  console.log('Attempting login for email:', loginData?.email);

  // Basic Input Validation
  if (!loginData?.email || !loginData?.password) {
    console.error('Login Error: Missing email or password');
    throw new Error('Email and password are required.');
  }

  const { email, password } = loginData;

  // Call Supabase signInWithPassword
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Supabase SignIn Error:', error.message);
    // Common errors: Invalid login credentials
    return { success: false, error: error, message: error.message };
  }

  if (!data.session || !data.user) {
     console.error('Supabase SignIn Error: No session/user data returned despite no error.');
     // Handle unlikely case
     return { success: false, message: 'Login failed for an unknown reason.' };
  }

  console.log('User logged in successfully:', data.user.id);
  // Return user and session info (session contains the JWT access_token)
  return { success: true, user: data.user, session: data.session, message: 'User logged in successfully.' };
}; 