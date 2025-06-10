import { supabaseServiceRole } from '../../config/supabaseClient';
import { createClinicSchema, updateClinicSchema } from '../../validation/admin/clinic.admin.validation';
import { z } from 'zod';
import { AppError } from '../../utils/errors';

const TABLE_NAME = 'clinics';

type CreateClinicDTO = z.infer<typeof createClinicSchema>;
type UpdateClinicDTO = z.infer<typeof updateClinicSchema>;

export const clinicService = {
  create: async (clinicData: CreateClinicDTO) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).insert(clinicData).select().single();
    if (error) {
      console.error('Supabase error creating clinic:', error);
      throw new AppError('Failed to create clinic.', 500);
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
      console.error('Supabase error fetching clinics:', error);
      throw new AppError('Failed to fetch clinics.', 500);
    }
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).select('*').eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('Clinic not found.', 404);
        }
        console.error(`Supabase error fetching clinic with id ${id}:`, error);
        throw new AppError('Failed to fetch clinic.', 500);
    }
    return data;
  },

  update: async (id: string, clinicData: UpdateClinicDTO) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).update(clinicData).eq('id', id).select().single();
    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('Clinic not found.', 404);
        }
        console.error(`Supabase error updating clinic with id ${id}:`, error);
        throw new AppError('Failed to update clinic.', 500);
    }
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabaseServiceRole.from(TABLE_NAME).delete().eq('id', id);
    if (error) {
      console.error(`Supabase error deleting clinic with id ${id}:`, error);
      throw new AppError('Failed to delete clinic.', 500);
    }
    return { message: 'Clinic deleted successfully.' };
  },
}; 