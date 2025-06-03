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
    console.log("[AdminProviderService.createProvider] Incoming providerData:", JSON.stringify(providerData, null, 2));
    // Note: createProviderBodySchema expects camelCase from the route validation
    // We need to transform to snake_case for Supabase insertion if not already handled by Supabase client
    const dbCreateData: { [key: string]: any } = {};
    if (providerData.userId !== undefined) dbCreateData.user_id = providerData.userId;
    if (providerData.firstName !== undefined) dbCreateData.first_name = providerData.firstName;
    if (providerData.lastName !== undefined) dbCreateData.last_name = providerData.lastName;
    if (providerData.email !== undefined) dbCreateData.email = providerData.email;
    if (providerData.phoneNumber !== undefined) dbCreateData.contact_number = providerData.phoneNumber;
    // if (providerData.specialization !== undefined) dbCreateData.specialization = providerData.specialization; // Field removed
    // if (providerData.licenseNumber !== undefined) dbCreateData.license_number = providerData.licenseNumber; // Field removed
    // if (providerData.credentials !== undefined) dbCreateData.credentials = providerData.credentials; // Field removed
    // if (providerData.bio !== undefined) dbCreateData.bio = providerData.bio; // Field removed
    if (providerData.isActive !== undefined) dbCreateData.is_active = providerData.isActive;
    // Ensure default for isActive if not provided, matching schema
    else if (providerData.isActive === undefined) dbCreateData.is_active = true; 

    console.log("[AdminProviderService.createProvider] Transformed dbCreateData for Supabase:", JSON.stringify(dbCreateData, null, 2));

    const { data, error }: PostgrestSingleResponse<Provider> = await supabaseServiceRole
      .from(this.tableName)
      .insert(dbCreateData) // Use transformed snake_case data
      .select()
      .single();

    if (error) {
      console.error("[AdminProviderService.createProvider] Supabase error:", JSON.stringify(error, null, 2));
      if (error.code === '23505') {
        throw new AppError(`Provider with this email already exists: ${dbCreateData.email}`, 409);
      }
      throw new AppError(`Error creating provider: ${error.message}`, 500, error.details);
    }
    if (!data) {
        console.error("[AdminProviderService.createProvider] No data returned from Supabase after insert.");
        throw new AppError('Provider could not be created, no data returned.', 500);
    }
    console.log("[AdminProviderService.createProvider] Supabase success. Returned data:", JSON.stringify(data, null, 2));
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
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
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
    console.log(`[AdminProviderService.getProviderById] Called with providerId: ${providerId}`);
    const { data, error }: PostgrestSingleResponse<Provider> = await supabaseServiceRole
      .from(this.tableName)
      .select('*')
      .eq('id', providerId)
      .single();

    if (error) {
      console.error(`[AdminProviderService.getProviderById] Supabase error:`, JSON.stringify(error, null, 2));
      if (error.code === 'PGRST116') {
        console.warn(`[AdminProviderService.getProviderById] Provider with ID ${providerId} not found.`);
        return null;
      }
      throw new AppError(`Error fetching provider: ${error.message}`, 500, error.details);
    }
    console.log(`[AdminProviderService.getProviderById] Supabase success. Returned data:`, data ? JSON.stringify(data, null, 2) : 'null');
    return data;
  }

  async updateProvider(providerId: string, providerData: UpdateProviderBody): Promise<Provider | null> {
    console.log(`[AdminProviderService.updateProvider] Called with providerId: ${providerId}`);
    console.log(`[AdminProviderService.updateProvider] Incoming providerData (camelCase from Zod validation):`, JSON.stringify(providerData, null, 2));

    const dbData: { [key: string]: any } = {};
    // Transform camelCase from providerData (validated request body) to snake_case for Supabase
    if (providerData.firstName !== undefined) dbData.first_name = providerData.firstName;
    if (providerData.lastName !== undefined) dbData.last_name = providerData.lastName;
    if (providerData.email !== undefined) dbData.email = providerData.email; // email key is the same
    if (providerData.phoneNumber !== undefined) dbData.contact_number = providerData.phoneNumber; // Map phoneNumber to contact_number
    if (providerData.isActive !== undefined) dbData.is_active = providerData.isActive;
    if (providerData.userId !== undefined) dbData.user_id = providerData.userId; // If userId is updatable from form

    console.log(`[AdminProviderService.updateProvider] Transformed dbData (snake_case) for Supabase update:`, JSON.stringify(dbData, null, 2));

    if (Object.keys(dbData).length === 0) {
      console.warn("[AdminProviderService.updateProvider] No fields to update after transformation. Provider data might be identical or no valid fields were provided.");
      // Fetch and return current data as no update is being performed.
      // This ensures the frontend gets a valid Provider object back if it expects one.
      return this.getProviderById(providerId); 
    }

    const { data, error }: PostgrestSingleResponse<Provider> = await supabaseServiceRole
      .from(this.tableName)
      .update(dbData) // Use the transformed snake_case data
      .eq('id', providerId)
      .select() // Select the updated row
      .single();   // Expect a single row back

    if (error) {
      console.error(`[AdminProviderService.updateProvider] Supabase error on update:`, JSON.stringify(error, null, 2));
      if (error.code === 'PGRST116') { // Row not found by .eq or .single()
        console.warn(`[AdminProviderService.updateProvider] Provider with ID ${providerId} not found for update, or RLS prevented update/select.`);
        return null;
      }
      if (error.code === '23505') { // Unique constraint violation
        console.warn(`[AdminProviderService.updateProvider] Unique constraint violation during update (e.g., email).`);
        // Attempt to determine which field caused it, if possible, or use a generic message.
        // For email specifically: if (providerData.email && error.message.includes('email')) ...
        throw new AppError(`A provider with similar details (e.g., email) already exists.`, 409);
      }
      throw new AppError(`Error updating provider: ${error.message}`, 500, error.details);
    }
    
    if (!data) {
        console.warn(`[AdminProviderService.updateProvider] No data returned from Supabase after update for provider ID ${providerId}, though no explicit error. This can happen if RLS prevented the SELECT or if the row was not found by .single() after update.`);
        return null; 
    }

    console.log(`[AdminProviderService.updateProvider] Supabase success. Returned data after update:`, JSON.stringify(data, null, 2));
    return data;
  }

  async deleteProvider(providerId: string): Promise<boolean> {
    // Consider soft delete (setting is_active = false) vs. hard delete.
    // The current implementation implies hard delete.
    // If soft delete: use .update({ is_active: false })
    // Also, consider what to do with associations (e.g., clinic_providers).
    // Supabase table relations with ON DELETE CASCADE/SET NULL can handle this at DB level.
    console.log(`[AdminProviderService.deleteProvider] Called with providerId: ${providerId}`);
    const { error, count } = await supabaseServiceRole
      .from(this.tableName)
      .delete({ count: 'exact' })
      .eq('id', providerId);

    if (error) {
      console.error(`[AdminProviderService.deleteProvider] Supabase error:`, JSON.stringify(error, null, 2));
      throw new AppError(`Error deleting provider: ${error.message}`, 500, error.details);
    }
    console.log(`[AdminProviderService.deleteProvider] Supabase success. Delete count: ${count}`);
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