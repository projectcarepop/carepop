'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type ProviderFormValues = {
    profileId: string;
    licenseNumber?: string;
    bio?: string;
    acceptingNewPatients: boolean;
};

export async function createProviderAction(values: ProviderFormValues) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to create provider.' };
    }
    
    revalidatePath('/admin/providers');
    redirect('/admin/providers');
}

export async function updateProviderAction(id: string, values: Partial<ProviderFormValues>) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to update provider.' };
    }

    revalidatePath('/admin/providers');
    revalidatePath(`/admin/providers/${id}/edit`);
    redirect('/admin/providers');
}

export async function deleteProviderAction(id: string) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/providers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to delete provider.' };
    }

    revalidatePath('/admin/providers');
    return { success: true };
} 