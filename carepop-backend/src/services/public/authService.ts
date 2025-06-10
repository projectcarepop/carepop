import { supabase } from '@/lib/supabase/client';
import { ApiError } from '@/utils/ApiError';

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
          full_name: `${firstName} ${lastName}`,
        },
      },
    });

    if (error) {
      throw new ApiError(400, error.message);
    }
    if (!data.user) {
      throw new ApiError(500, 'Sign up failed: no user returned');
    }
    
    // Also create a profile entry
    const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        email: data.user.email,
        first_name: firstName,
        last_name: lastName,
    });

    if (profileError) {
        // This is a tricky situation. The user is created in auth but profile creation failed.
        // For now, we'll log it and throw, but a more robust solution might involve cleanup.
        console.error('Error creating profile for new user:', profileError);
        throw new ApiError(500, `User created but profile setup failed: ${profileError.message}`);
    }


    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ApiError(401, error.message);
    }
    if (!data.user) {
        throw new ApiError(500, 'Login failed: no user returned');
    }
    return data;
  }
} 