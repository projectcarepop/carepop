import { supabaseServiceRole } from '@/config/supabaseClient';
import { createServiceCategorySchema, updateServiceCategorySchema } from '@/validation/admin/service-category.admin.validation';
import { z } from 'zod';
import { AppError } from '@/utils/errors';

const TABLE_NAME = 'service_categories';

type CreateServiceCategoryDTO = z.infer<typeof createServiceCategorySchema>;
type UpdateServiceCategoryDTO = z.infer<typeof updateServiceCategorySchema>;

export const serviceCategoryService = {
  create: async (categoryData: CreateServiceCategoryDTO) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).insert(categoryData).select().single();
    if (error) { throw new AppError('Failed to create service category.', 500); }
    return data;
  },

  getAll: async (searchQuery?: string) => {
    let query = supabaseServiceRole.from(TABLE_NAME).select('*');

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching service categories:', error);
      throw new AppError('Failed to fetch service categories.', 500);
    }
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).select('*').eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') { throw new AppError('Service category not found.', 404); }
        throw new AppError('Failed to fetch service category.', 500);
    }
    return data;
  },

  update: async (id: string, categoryData: UpdateServiceCategoryDTO) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).update(categoryData).eq('id', id).select().single();
    if (error) {
        if (error.code === 'PGRST116') { throw new AppError('Service category not found.', 404); }
        throw new AppError('Failed to update service category.', 500);
    }
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabaseServiceRole.from(TABLE_NAME).delete().eq('id', id);
    if (error) { throw new AppError('Failed to delete service category.', 500); }
    return { message: 'Service category deleted successfully.' };
  },
}; 