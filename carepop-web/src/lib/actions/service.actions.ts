'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type ServiceFormValues = {
    name: string;
    description?: string;
    price: string;
    durationMinutes: number;
    specializationId: string;
    isActive: boolean;
};

export async function createServiceAction(values: ServiceFormValues) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to create service.' };
    }
    
    revalidatePath('/admin/services');
    redirect('/admin/services');
}

export async function updateServiceAction(id: string, values: Partial<ServiceFormValues>) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to update service.' };
    }

    revalidatePath('/admin/services');
    revalidatePath(`/admin/services/${id}/edit`);
    redirect('/admin/services');
}

export async function deleteServiceAction(id: string) {
    const { getToken, userId } = await auth();
    if (!userId) {
        return { success: false, message: 'Unauthorized' };
    }
    const token = await getToken();

    const response = await fetch(`${API_URL}/api/v1/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to delete service.' };
    }

    revalidatePath('/admin/services');
    return { success: true };
} 