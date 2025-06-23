'use server';

import { auth } from '@clerk/nextjs/server';
import { AppError } from '../utils/AppError';
import { API_BASE_URL } from '../config';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const session = auth();
  const token = await session.getToken();

  if (!token) {
    throw new AppError('Not authenticated', 401);
  }

  const adminApiUrl = API_BASE_URL.replace('/public', '');

  const res = await fetch(`${adminApiUrl}/admin/inventory/suppliers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store', // Ensure fresh data is fetched every time
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new AppError(errorData.message || 'Failed to fetch suppliers', res.status);
  }

  return res.json();
} 