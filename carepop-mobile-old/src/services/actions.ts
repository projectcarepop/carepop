// This file will contain functions that interact with our backend,
// but are designed to be called from the mobile client, potentially
// handling things like secure storage access for tokens.

import { createClient } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase'; // Use the initialized Supabase client

/**
 * This function does not directly interact with Supabase storage from the client
 * for security reasons. Instead, it should call a dedicated backend endpoint
 * that can verify the user's session and then generate a signed URL.
 * 
 * For this implementation, we will assume a backend endpoint exists at
 * `/api/me/documents/signed-url` which takes a `filePath` in the body.
 */
export async function downloadDocument(filePath: string): Promise<{ downloadUrl?: string; error?: string }> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Authentication required.');
    }

    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/me/documents/signed-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ filePath }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get download link.');
    }

    const data = await response.json();
    return { downloadUrl: data.signedUrl };

  } catch (error: any) {
    console.error("Error getting signed URL:", error);
    return { error: error.message || 'An unknown error occurred.' };
  }
} 