import { supabaseServiceRole } from '../../config/supabaseClient';
import { createServiceSchema, updateServiceSchema } from '../../validation/admin/service.admin.validation';
import { z } from 'zod';
import { AppError } from '../../utils/errors';

const TABLE_NAME = 'services';

type CreateServiceDTO = z.infer<typeof createServiceSchema>;
type UpdateServiceDTO = z.infer<typeof updateServiceSchema>;

export const serviceService = {
  create: async (serviceData: CreateServiceDTO) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).insert(serviceData).select().single();
    if (error) { throw new AppError('Failed to create service.', 500); }
    return data;
  },

  getAll: async (searchQuery?: string) => {
    let query = supabaseServiceRole
      .from('services')
      .select('*, category:service_categories(name)');
    
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) { throw new AppError('Failed to fetch services.', 500); }
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).select(`
      *,
      service_categories (id, name)
    `).eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') { throw new AppError('Service not found.', 404); }
        throw new AppError('Failed to fetch service.', 500);
    }
    return data;
  },

  update: async (id: string, serviceData: UpdateServiceDTO) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).update(serviceData).eq('id', id).select().single();
    if (error) {
        if (error.code === 'PGRST116') { throw new AppError('Service not found.', 404); }
        throw new AppError('Failed to update service.', 500);
    }
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabaseServiceRole.from(TABLE_NAME).delete().eq('id', id);
    if (error) { throw new AppError('Failed to delete service.', 500); }
    return { message: 'Service deleted successfully.' };
  },
}; 