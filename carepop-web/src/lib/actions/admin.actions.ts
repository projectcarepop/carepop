'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const profileData = {
    first_name: formData.get('firstName'),
    last_name: formData.get('lastName'),
    // ... add other fields from your ProfileForm
  };

  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to update user profile.');
  }

  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function createNewUser(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !role) {
    throw new Error('Email, password, and role are required.');
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: email,
      role: role,
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
    });

    if (profileError) {
      // TODO: Should probably delete the auth user if profile creation fails.
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }
  }

  revalidatePath('/admin/users');
  return { success: true, user: authData.user };
} 