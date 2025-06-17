'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
    const supabase = createClient();

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating user role:', error);
        return { success: false, message: 'Failed to update user role.' };
    }

    revalidatePath('/admin/users');
    return { success: true, message: 'User role updated successfully.' };
} 