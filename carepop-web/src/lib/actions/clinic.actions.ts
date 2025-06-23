'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type ClinicFormValues = {
    name: string;
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    contactPhone?: string;
    contactEmail?: string;
    isActive: boolean;
};

export async function createClinicAction(values: ClinicFormValues) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/clinics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to create clinic.' };
    }
    
    revalidatePath('/admin/clinics');
    redirect('/admin/clinics');
}

export async function updateClinicAction(id: string, values: ClinicFormValues) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/clinics/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to update clinic.' };
    }

    revalidatePath('/admin/clinics');
    revalidatePath(`/admin/clinics/${id}/edit`);
    redirect('/admin/clinics');
}

export async function deleteClinicAction(id: string) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/clinics/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to delete clinic.' };
    }

    revalidatePath('/admin/clinics');
    return { success: true };
} 