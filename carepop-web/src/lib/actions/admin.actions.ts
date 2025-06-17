'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { handleSupabaseError } from '../utils/errors';
import { AuthError } from '@supabase/supabase-js';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// A specific handler for AuthErrors, as they have a different shape from PostgrestErrors.
function handleAuthError(error: AuthError): { message: string, details?: string } {
    console.error('Supabase Auth Error:', {
        message: error.message,
        status: error.status,
    });
    return { 
        message: 'An authentication error occurred. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
}

const clinicSchema = z.object({
  name: z.string().min(2),
  full_address: z.string().min(10),
  contact_email: z.string().email(),
  contact_phone: z.string().min(7),
  operating_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

export async function uploadMedicalRecord(userId: string, formData: FormData) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  if (!userId) {
    throw new Error('User ID was not provided to the server action');
  }

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const response = await fetch(
    `${apiUrl}/api/v1/admin/users/${userId}/records`,
    {
      method: 'POST',
      headers: {
        // 'Content-Type' is set by the browser for FormData
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    console.error('Backend API returned an error:');
    console.error(`Status: ${response.status} (${response.statusText})`);
    
    let errorData;
    try {
      errorData = await response.json();
      console.error('Backend Error Body:', JSON.stringify(errorData, null, 2));
    } catch {
      errorData = { message: 'Failed to parse backend error response as JSON.' };
      console.error(errorData.message);
    }

    throw new Error(errorData.message || 'An unhandled error occurred on the backend.');
  }

  revalidatePath(`/admin/users/${userId}`);
  return { success: true, data: await response.json() };
}

export async function deleteMedicalRecord(recordId: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const response = await fetch(
    `${apiUrl}/api/v1/admin/medical-records/${recordId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete medical record');
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function saveUserProfile(
  userId: string,
  profileData: { first_name: string; last_name: string; role: string },
) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const response = await fetch(
    `${apiUrl}/api/v1/admin/users/${userId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(profileData),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save user profile');
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/users');

  return { success: true, data: await response.json() };
}

export async function updateUserProfile(userId: string, formData: FormData) {
  const supabase = createClient();
  
  try {
    const profileData = {
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      // ... add other fields from your ProfileForm
    };

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', userId); // Ensure we are matching on user_id

    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    revalidatePath(`/admin/users/${userId}`);
    return { data: { success: true }, error: null };
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { data: null, error: { message: e.message } };
    }
    return { data: null, error: { message: 'An unexpected error occurred.' } };
  }
}

export async function createNewUser(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    if (!email || !password || !role) {
      throw new Error('Email, password, and role are required.');
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Recommended to keep this true
    });

    if (authError) {
      // Use the new auth error handler
      return { data: null, error: handleAuthError(authError) };
    }
    
    if (!authData.user) {
        throw new Error("User creation did not return a user object.");
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id, // Correctly use user_id
      email: email,
      // You may need to map the role string to your role enum or ID
    });

    if (profileError) {
      // TODO: Should probably delete the auth user if profile creation fails (compensation transaction).
      console.warn(`User ${authData.user.id} was created in auth, but profile creation failed. Manual cleanup may be required.`);
      return { data: null, error: handleSupabaseError(profileError) };
    }
    
    revalidatePath('/admin/users');
    return { data: authData.user, error: null };

  } catch (e: unknown) {
    if (e instanceof Error) {
        return { data: null, error: { message: e.message } };
    }
    return { data: null, error: { message: 'An unexpected error occurred.' }};
  }
}

export async function createClinic(values: z.infer<typeof clinicSchema>) {
    'use server';

    try {
        const supabase = await createSupabaseServerClient();
        const validatedData = clinicSchema.parse(values);

        const { data, error } = await supabase
            .from('clinics')
            .insert(validatedData)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return { error: { message: `Supabase error: ${error.message}` } };
        }

        revalidatePath('/admin/clinics');
        return { data };

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return { error: { message: 'Validation failed', issues: error.errors } };
        }
        if (error instanceof Error) {
            return { error: { message: error.message } };
        }
        return { error: { message: 'An unknown error occurred.' } };
    }
}

export async function updateClinic(id: string, values: Record<string, unknown>) {
    'use server';
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
        .from('clinics')
        .update(values)
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        return handleSupabaseError(error);
    }

    revalidatePath('/admin/clinics');
    revalidatePath(`/admin/clinics/${id}/edit`);
    revalidatePath('/');
    return { data, error: null };
}
