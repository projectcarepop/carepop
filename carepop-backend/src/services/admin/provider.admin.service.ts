import { supabaseServiceRole } from '../../config/supabaseClient'; // Use service_role client
import { AppError } from '../../utils/errors';
import { CreateProviderBody, UpdateProviderBody, ListProvidersQuery } from '../../validation/admin/provider.admin.validation';
import { PostgrestResponse, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';

type Provider = Database['public']['Tables']['providers']['Row'];
type ProviderInsert = Database['public']['Tables']['providers']['Insert'];
type ProviderUpdate = Database['public']['Tables']['providers']['Update'];

interface ListProvidersResult {
  data: Provider[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminProviderService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseInstance: SupabaseClient<Database>) {
    this.supabase = supabaseInstance;
  }

  async createProvider(providerData: CreateProviderBody): Promise<Provider> {
    console.log("[AdminProviderService.createProvider] Incoming providerData:", JSON.stringify(providerData, null, 2));
    
    const dbCreateData: ProviderInsert = {
      user_id: providerData.userId,
      first_name: providerData.firstName,
      last_name: providerData.lastName,
      email: providerData.email,
      contact_number: providerData.phoneNumber,
      is_active: providerData.isActive ?? true,
    };

    console.log("[AdminProviderService.createProvider] Transformed dbCreateData for Supabase:", JSON.stringify(dbCreateData, null, 2));

    const { data, error } = await this.supabase
      .from('providers')
      .insert(dbCreateData)
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
    
    let query = this.supabase
      .from('providers')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    if (typeof isActive === 'boolean') {
      query = query.eq('is_active', isActive);
    }

    query = query.order(sortBy as keyof Provider, { ascending: sortOrder === 'asc' })
                 .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

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
    const { data, error } = await this.supabase
      .from('providers')
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

    const dbData: ProviderUpdate = {};
    if (providerData.firstName !== undefined) dbData.first_name = providerData.firstName;
    if (providerData.lastName !== undefined) dbData.last_name = providerData.lastName;
    if (providerData.email !== undefined) dbData.email = providerData.email;
    if (providerData.phoneNumber !== undefined) dbData.contact_number = providerData.phoneNumber;
    if (providerData.isActive !== undefined) dbData.is_active = providerData.isActive;
    if (providerData.userId !== undefined) dbData.user_id = providerData.userId;

    console.log(`[AdminProviderService.updateProvider] Transformed dbData (snake_case) for Supabase update:`, JSON.stringify(dbData, null, 2));

    if (Object.keys(dbData).length === 0) {
      console.warn("[AdminProviderService.updateProvider] No fields to update after transformation. Provider data might be identical or no valid fields were provided.");
      return this.getProviderById(providerId); 
    }

    const { data, error } = await this.supabase
      .from('providers')
      .update(dbData)
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      console.error(`[AdminProviderService.updateProvider] Supabase error on update:`, JSON.stringify(error, null, 2));
      if (error.code === 'PGRST116') {
        console.warn(`[AdminProviderService.updateProvider] Provider with ID ${providerId} not found for update, or RLS prevented update/select.`);
        return null;
      }
      if (error.code === '23505') {
        console.warn(`[AdminProviderService.updateProvider] Unique constraint violation during update (e.g., email).`);
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
    console.log(`[AdminProviderService.deleteProvider] Called with providerId: ${providerId}`);
    const { error, count } = await this.supabase
      .from('providers')
      .delete({ count: 'exact' })
      .eq('id', providerId);

    if (error) {
      console.error(`[AdminProviderService.deleteProvider] Supabase error:`, JSON.stringify(error, null, 2));
      throw new AppError(`Error deleting provider: ${error.message}`, 500, error.details);
    }
    console.log(`[AdminProviderService.deleteProvider] Supabase success. Delete count: ${count}`);
    return count !== null && count > 0;
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