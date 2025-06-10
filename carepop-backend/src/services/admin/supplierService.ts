import { supabaseServiceRole } from '@/config/supabaseClient';
import { createSupplierSchema } from '@/validation/admin/supplier.admin.validation';
import { z } from 'zod';
import { AppError } from '@/utils/errors';

const TABLE_NAME = 'suppliers';

type CreateSupplierDTO = z.infer<typeof createSupplierSchema>;

export const supplierService = {
  create: async (supplierData: CreateSupplierDTO) => {
    const { data, error } = await supabaseServiceRole
      .from(TABLE_NAME)
      .insert(supplierData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating supplier:', error);
      throw new AppError('Failed to create supplier.', 500);
    }
    return data;
  },

  getAll: async (searchQuery?: string) => {
    let query = supabaseServiceRole.from(TABLE_NAME).select('*');
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Supabase error fetching suppliers:', error);
      throw new AppError('Failed to fetch suppliers.', 500);
    }
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole
      .from(TABLE_NAME)
      .select()
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error fetching supplier:', error);
      throw new AppError('Failed to fetch supplier.', 500);
    }
    return data;
  },

  // ... other methods (getAll, getById, update, delete) would follow the same pattern
}; 