import { supabase, supabaseServiceRole } from '../config/supabaseClient';
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

  // Call Supabase signUp (Restoring options block)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: { // Restore options block
      // Include any initial data from registration form if needed, ensure keys match profiles table columns
      data: {
        first_name: userData.first_name || null,
        last_name: userData.last_name || null,
        // Add other fields from registration form here if applicable
      }
    }
  });

  if (signUpError) {
    console.error('Supabase SignUp Error:', signUpError.message);
    return { success: false, error: signUpError, message: signUpError.message };
  }

  if (!signUpData.user) {
    console.error('Supabase SignUp Error: No user data returned despite no error.');
    return { success: false, message: 'User registration failed for an unknown reason.' };
  }

  // --- Create Profile Entry --- 
  // Use a separate try-catch for profile creation to handle potential errors without losing the successful auth user
  try {
    // Note: Supabase RLS policy allows user to insert their own profile using auth.uid()
    // We are using the user's own session here implicitly from the JS client perspective,
    // although technically this runs server-side. If using service_role key, ensure user_id is set correctly.
    
    // *** Use the service role client to bypass RLS for this trusted server-side operation ***
    const { error: profileError } = await supabaseServiceRole // Use service role client here
      .from('profiles')
      .insert({
        user_id: signUpData.user.id, // Link to the newly created auth user
        // Extract relevant data from registration input (userData) or use defaults
        // Ensure these match the columns in your profiles table
        first_name: userData.first_name || null, // Example: getting first name from input
        last_name: userData.last_name || null,   // Example: getting last name from input
        phone_number: userData.phone_number || null, // Example
        granular_consents: { initial_consent_given: userData.consent_given === true }, // Store boolean in JSONB
        // granular_consents: {}, // Set initial consents if needed
      });

    if (profileError) {
      // Log the error but potentially still return success for user creation
      // Alternatively, could attempt to delete the auth user for atomicity (complex)
      console.error('Failed to create profile after signup:', profileError.message);
      // Consider returning a partial success message or specific error state
      return { success: true, user: signUpData.user, message: 'User registered, but profile creation failed. Please contact support.' };
    }

    console.log('User profile created successfully for:', signUpData.user.id);

  } catch (profileCatchError: any) {
      console.error('Unexpected error creating profile:', profileCatchError.message);
      // Decide on return value - user exists but profile failed
      return { success: true, user: signUpData.user, message: 'User registered, profile creation error. Contact support.' };
  }
  // --- End Profile Entry --- 

  console.log('User registered successfully:', signUpData.user.id);
  return { success: true, user: signUpData.user, message: 'User registered successfully. Please check your email for verification.' };
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