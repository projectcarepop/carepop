import { supabaseServiceRole } from '../../config/supabaseClient';
import { createProviderBodySchema, updateProviderBodySchema } from '../../validation/admin/provider.admin.validation';
import { z } from 'zod';
import { AppError } from '../../utils/errors';

const PROVIDERS_TABLE = 'providers';
const USER_ROLES_TABLE = 'user_roles';

type CreateProviderDTO = z.infer<typeof createProviderBodySchema>;
type UpdateProviderDTO = z.infer<typeof updateProviderBodySchema>;

export const providerService = {
  create: async (providerData: CreateProviderDTO) => {
    // Transaction-like logic: 1. Add role, 2. Create provider profile
    
    // Step 1: Ensure user has the 'provider' role.
    // upsert will either insert the role or do nothing if it already exists.
    const { error: roleError } = await supabaseServiceRole
      .from(USER_ROLES_TABLE)
      .upsert({ user_id: providerData.user_id, role: 'provider' }, { onConflict: 'user_id, role' });

    if (roleError) {
      console.error('Supabase error assigning provider role:', roleError);
      throw new AppError('Failed to assign provider role.', 500);
    }

    // Step 2: Create the provider profile.
    const { data, error: providerError } = await supabaseServiceRole
      .from(PROVIDERS_TABLE)
      .insert(providerData)
      .select()
      .single();

    if (providerError) {
      console.error('Supabase error creating provider profile:', providerError);
      // Here you might want to add logic to roll back the role assignment if creation fails.
      // For now, we'll just throw the error.
      throw new AppError('Failed to create provider profile.', 500);
    }
    return data;
  },

  getAll: async (searchQuery?: string) => {
    let query = supabaseServiceRole.from(PROVIDERS_TABLE).select('*');

    if (searchQuery) {
      // Use ilike for case-insensitive search on the indexed full_name column
      query = query.ilike('full_name', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) { throw new AppError('Failed to fetch providers.', 500); }
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole.from(PROVIDERS_TABLE).select('*').eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') { throw new AppError('Provider not found.', 404); }
        throw new AppError('Failed to fetch provider.', 500);
    }
    return data;
  },

  update: async (id: string, providerData: UpdateProviderDTO) => {
    const { data, error } = await supabaseServiceRole.from(PROVIDERS_TABLE).update(providerData).eq('id', id).select().single();
    if (error) {
        if (error.code === 'PGRST116') { throw new AppError('Provider not found.', 404); }
        throw new AppError('Failed to update provider.', 500);
    }
    return data;
  },

  // Note: Deleting a provider probably shouldn't delete the user, just the provider profile.
  // The role might be removed or kept depending on business logic.
  delete: async (id: string) => {
    const { error } = await supabaseServiceRole.from(PROVIDERS_TABLE).delete().eq('id', id);
    if (error) { throw new AppError('Failed to delete provider.', 500); }
    return { message: 'Provider profile deleted successfully.' };
  },
}; 