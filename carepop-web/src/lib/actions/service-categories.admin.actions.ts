'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { serviceCategorySchema, TServiceCategory } from '@/lib/types/service-category.types';
import { TApiError, TApiSuccess } from '@/lib/types/api.types';
import { fromZodError } from 'zod-validation-error';
import { cookies } from 'next/headers';

const getSupabase = () => createSupabaseServerClient(cookies());

export async function getAllServiceCategories(options?: { page?: number, limit?: number, search?: string }): Promise<TApiSuccess<{ categories: TServiceCategory[], total: number }> | TApiError> {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const search = options?.search;
  const offset = (page - 1) * limit;

  let query = getSupabase()
    .from('service_categories')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error, count } = await query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return { success: false, error: { message: error.message } };
  }
  return { success: true, data: { categories: data, total: count ?? 0 } };
}

export async function getServiceCategoryById(id: string): Promise<TApiSuccess<TServiceCategory> | TApiError> {
  const { data, error } = await getSupabase()
    .from('service_categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { success: false, error: { message: error.message } };
  }
  return { success: true, data };
}

export async function createServiceCategory(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validation = serviceCategorySchema.safeParse(rawFormData);

  if (!validation.success) {
    return {
      error: fromZodError(validation.error).toString(),
    };
  }
  
  const { error } = await getSupabase()
    .from('service_categories')
    .insert(validation.data);

  if (error) {
     return {
      error: error.message,
    };
  }

  revalidatePath('/admin/services');
  return {
    message: 'Service category created successfully.',
  };
}

export async function updateServiceCategory(id: string, formData: FormData) {
    const rawFormData = Object.fromEntries(formData.entries());
    const validation = serviceCategorySchema.safeParse(rawFormData);

    if (!validation.success) {
        return {
        error: fromZodError(validation.error).toString(),
        };
    }

    const { error } = await getSupabase()
        .from('service_categories')
        .update(validation.data)
        .eq('id', id);

    if (error) {
        return {
        error: error.message,
        };
    }

    revalidatePath('/admin/services');
    revalidatePath(`/admin/service-categories/${id}/edit`);
     return {
        message: 'Service category updated successfully.',
    };
}


export async function deleteServiceCategory(id: string) {
    const { error } = await getSupabase().from('service_categories').delete().eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
    revalidatePath('/admin/services');
} 