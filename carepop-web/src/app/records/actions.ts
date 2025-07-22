'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function downloadDocument(filePath: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.storage
        .from('medical-documents')
        .createSignedUrl(filePath, 60 * 5); // 5-minute expiry

    if (error) {
        console.error('Error creating signed URL:', error);
        return { error: 'Failed to create download link.' };
    }

    const fileName = filePath.split('/').pop();

    return { downloadUrl: data.signedUrl, fileName };
} 