'use server';

import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

// Use the correct backend URL, assuming it runs on 8080 as per the project's other actions.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function getUserDetailsAction(userId: string) {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('User not authenticated.');
    }

    // Construct the full URL correctly
    const fetchUrl = `${API_BASE_URL}/api/v1/admin/users/${userId}`;
    
    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to fetch user details: ${errorData.message || 'Server returned an error'}`);
    }

    return response.json();
  } catch (error) {
    console.error('[getUserDetailsAction] Error:', error);
    // In a real app, you might want to return a more structured error object
    return null;
  }
} 