import { supabaseServiceRole } from '../../config/supabaseClient'; // Use service_role client
import { AppError } from '../../utils/errors';
import { CreateProviderBody, UpdateProviderBody, ListProvidersQuery } from '../../validation/admin/provider.admin.validation';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

// Define a basic Provider type - this should ideally match your database schema / ORM model
// Or be imported from a shared types location
interface Provider {
  id: string;
  user_id?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  specialization?: string | null;
  license_number?: string | null;
  credentials?: string | null;
  bio?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // services?: any[]; // If handling service associations here
}

interface ListProvidersResult {
  data: Provider[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminProviderService {
  private tableName = 'providers'; // Or your actual table name

  async createProvider(providerData: CreateProviderBody): Promise<Provider> {
    // In a real scenario, you might want to check if email is unique
    // or if userId, if provided, is valid and not already linked to another provider.
    // Also, if providerData.services is present, handle associating services.

    const { data, error }: PostgrestSingleResponse<Provider> = await supabaseServiceRole
      .from(this.tableName)
      .insert(providerData as any) // Cast to any if CreateProviderBody doesn't exactly match table
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation (e.g., email)
        throw new AppError(`Provider with this email already exists: ${providerData.email}`, 409);
      }
      // Consider other specific error codes for Supabase
      throw new AppError(`Error creating provider: ${error.message}`, 500, error.details);
    }
    if (!data) {
        throw new AppError('Provider could not be created, no data returned.', 500);
    }
    return data;
  }

  async listProviders(queryParams: ListProvidersQuery): Promise<ListProvidersResult> {
    let {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      searchTerm,
      isActive,
    } = queryParams;

    const offset = (page - 1) * limit;

    let dbSortBy = sortBy;
    if (sortBy === 'createdAt') {
      dbSortBy = 'created_at';
    }
    if (sortBy === 'updatedAt') {
      dbSortBy = 'updated_at';
    }

    let query = supabaseServiceRole
      .from(this.tableName)
      .select('*', { count: 'exact' });

    if (searchTerm) {
      // Assuming search term applies to first name, last name, email or specialization
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`);
    }

    if (typeof isActive === 'boolean') {
      query = query.eq('is_active', isActive);
    }

    query = query.order(dbSortBy, { ascending: sortOrder === 'asc' })
                 .range(offset, offset + limit - 1);

    const { data, error, count }: PostgrestResponse<Provider> = await query;

    if (error) {
      throw new AppError(`Error listing providers: ${error.message}`, 500, error.details);
    }
    
    const totalProviders = count ?? 0;
    const totalPages = Math.ceil(totalProviders / limit);

    return {
      data: data || [],
      count: totalProviders,
      page,
      limit,
      totalPages,
    };
  }

  async getProviderById(providerId: string): Promise<Provider | null> {
    const { data, error }: PostgrestSingleResponse<Provider> = await supabaseServiceRole
      .from(this.tableName)
      .select('*')
      .eq('id', providerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // "Actual row count" != "expected row count (1)"
        // This means 0 rows were found for .single()
        return null;
      }
      throw new AppError(`Error fetching provider: ${error.message}`, 500, error.details);
    }
    return data;
  }

  async updateProvider(providerId: string, providerData: UpdateProviderBody): Promise<Provider | null> {
    console.log(`[AdminProviderService.updateProvider] Called with providerId: ${providerId}`);
    console.log(`[AdminProviderService.updateProvider] Incoming providerData (camelCase):`, JSON.stringify(providerData, null, 2));

    const dbData: { [key: string]: any } = {};
    if (providerData.firstName !== undefined) dbData.first_name = providerData.firstName;
    if (providerData.lastName !== undefined) dbData.last_name = providerData.lastName;
    if (providerData.email !== undefined) dbData.email = providerData.email;
    if (providerData.phoneNumber !== undefined) dbData.contact_number = providerData.phoneNumber;
    if (providerData.isActive !== undefined) dbData.is_active = providerData.isActive;
    if (providerData.userId !== undefined) dbData.user_id = providerData.userId;

    console.log(`[AdminProviderService.updateProvider] Transformed dbData (snake_case) for Supabase:`, JSON.stringify(dbData, null, 2));

    if (Object.keys(dbData).length === 0) {
      console.log("[AdminProviderService.updateProvider] No valid fields to update after transformation. Fetching current data.");
      return this.getProviderById(providerId);
    }

    const { data, error }: PostgrestSingleResponse<Provider> = await supabaseServiceRole
      .from(this.tableName)
      .update(dbData)
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      console.error(`[AdminProviderService.updateProvider] Supabase error:`, JSON.stringify(error, null, 2));
      if (error.code === 'PGRST116') {
        console.warn(`[AdminProviderService.updateProvider] Provider with ID ${providerId} not found for update.`);
        return null;
      }
      if (error.code === '23505') {
        console.warn(`[AdminProviderService.updateProvider] Unique constraint violation for email.`);
        throw new AppError(`Provider with this email already exists.`, 409);
      }
      throw new AppError(`Error updating provider: ${error.message}`, 500, error.details);
    }
    
    if (!data) { // This condition might be hit if RLS prevents select, or if .single() expects one row but gets zero after an update that RLS filters out from select.
        console.warn(`[AdminProviderService.updateProvider] No data returned from Supabase after update for provider ID ${providerId}, though no explicit error was thrown. Possible RLS issue or provider not found by select after update.`);
        // Depending on desired behavior, you might return null or fetch the current state to see if it changed.
        // Returning null if no data is selected back might be correct if the update truly didn't apply or if the record became inaccessible.
        return null; 
    }

    console.log(`[AdminProviderService.updateProvider] Supabase success. Returned data:`, JSON.stringify(data, null, 2));
    return data;
  }

  async deleteProvider(providerId: string): Promise<boolean> {
    // Consider soft delete (setting is_active = false) vs. hard delete.
    // The current implementation implies hard delete.
    // If soft delete: use .update({ is_active: false })
    // Also, consider what to do with associations (e.g., clinic_providers).
    // Supabase table relations with ON DELETE CASCADE/SET NULL can handle this at DB level.

    const { error, count } = await supabaseServiceRole
      .from(this.tableName)
      .delete({ count: 'exact' }) // Request count of deleted rows
      .eq('id', providerId);

    if (error) {
      throw new AppError(`Error deleting provider: ${error.message}`, 500, error.details);
    }

    return count !== null && count > 0; // Successfully deleted if count is 1 or more
  }

  // Placeholder for associating services with a provider
  // async associateServices(providerId: string, serviceIds: string[]): Promise<void> {
  //   // This would typically involve deleting existing associations for this provider
  //   // in a 'provider_services' join table and then inserting the new ones.
  //   // Or, more granularly, finding diffs and adding/removing.
  //   // This needs to be transactional.
  //   console.log(providerId, serviceIds); 
  //
  // }
} 