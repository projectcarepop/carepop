'use server';

import { revalidatePath } from 'next/cache';
import { IAppointmentReport } from '../types/appointment-report.interface';
import { createClient } from '@/utils/supabase/server';

export async function getAppointmentReport(appointmentId: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/appointments/${appointmentId}/report`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null; // No report exists, which is fine
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch appointment report');
  }
  
  const result = await response.json();
  if (!result) return null;
  return result;
}

export async function saveAppointmentReport(reportData: Partial<IAppointmentReport>) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { id, ...dataToSave } = reportData;
  const url = id 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/reports/${id}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/reports`;
  
  const method = id ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(dataToSave),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save appointment report');
  }

  revalidatePath('/admin/users');
 
  return { success: true, data: await response.json() };
}

export async function uploadMedicalRecord(formData: FormData) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/medical-records`, {
    method: 'POST',
    headers: {
      // 'Content-Type': 'multipart/form-data' is set automatically by the browser with FormData
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload medical record');
  }

  revalidatePath('/admin/users');
  return { success: true, data: await response.json() };
}

export async function deleteMedicalRecord(recordId: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/medical-records/${recordId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete medical record');
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function saveUserProfile(userId: string, profileData: { first_name: string; last_name: string; role: string }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save user profile');
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/users');
  
  return { success: true, data: await response.json() };
} 