'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function uploadMedicalRecord(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${process.env.API_URL}/api/v1/admin/medical-records`,
    {
      method: 'POST',
      headers: {
        // 'Content-Type': 'multipart/form-data' is set automatically by the browser with FormData
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload medical record');
  }

  revalidatePath('/admin/users');
  return { success: true, data: await response.json() };
}

export async function deleteMedicalRecord(recordId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${process.env.API_URL}/api/v1/admin/medical-records/${recordId}`,
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

  const response = await fetch(
    `${process.env.API_URL}/api/v1/admin/users/${userId}`,
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