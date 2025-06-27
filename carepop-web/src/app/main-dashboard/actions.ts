'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signOutAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    // Optionally, redirect to an error page
    redirect('/auth/auth-code-error');
  }

  revalidatePath('/', 'layout');
  redirect('/sign-in');
}

export async function updateAvatarAction(formData: FormData) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const file = formData.get('avatar') as File;

    if (!file || file.size === 0) {
        return { success: false, error: "No file provided" };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Storage Error:", uploadError);
        return { success: false, error: "Failed to upload image." };
    }

    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Update the user's profile with the new avatar URL
    const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

    if (dbError) {
        console.error("Database Error:", dbError);
        return { success: false, error: "Failed to update profile." };
    }

    // Revalidate the path to show the new avatar immediately
    revalidatePath('/main-dashboard');
    revalidatePath('/profile'); // And any other relevant paths

    return { success: true, message: "Profile image updated successfully." };
} 