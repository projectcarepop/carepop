import { SupabaseClient } from '@supabase/supabase-js';
import { StatusCodes } from 'http-status-codes';
import { Database } from '../../types/supabase.types';
import { AppError } from '../../utils/errors';
import {
  CreateProviderBody,
  ListProvidersQuery,
  UpdateProviderBody,
} from '../../validation/admin/provider.admin.validation';
import logger from '../../utils/logger';

type Provider = Database['public']['Tables']['providers']['Row'];
type ProviderInsert = Database['public']['Tables']['providers']['Insert'] & { specialization?: string | null, license_number?: string | null, credentials?: string | null, bio?: string | null };
type ProviderUpdate = Database['public']['Tables']['providers']['Update'] & { specialization?: string | null, license_number?: string | null, credentials?: string | null, bio?: string | null };

export type ProviderWithServices = Provider & { serviceIds: string[] };

export class AdminProviderService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async createProvider(providerData: CreateProviderBody): Promise<Provider> {
    const { 
        firstName, 
        lastName, 
        phoneNumber,
        serviceIds,
        weeklyAvailability,
        specialization,
        licenseNumber,
        credentials,
        bio,
        avatarUrl,
        ...rest 
    } = providerData;

    const dbPayload: ProviderInsert = {
      ...rest,
      first_name: firstName,
      last_name: lastName,
      contact_number: phoneNumber,
      weekly_availability: weeklyAvailability,
      specialization: specialization,
      license_number: licenseNumber,
      credentials: credentials,
      bio: bio,
      avatar_url: avatarUrl,
    };

    const { data: provider, error } = await this.supabase
      .from('providers')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create provider in database.', { error });
      if (error.code === '23505') { // Unique constraint violation
        throw new AppError(
          'A provider with this email already exists.',
          StatusCodes.CONFLICT
        );
      }
      throw new AppError(
        'Failed to create provider in database.',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    
    if (serviceIds && serviceIds.length > 0) {
        const serviceLinks = serviceIds.map(serviceId => ({
            provider_id: provider.id,
            service_id: serviceId,
        }));
        const { error: serviceError } = await this.supabase.from('provider_services').insert(serviceLinks);
        if (serviceError) {
            logger.error(`Failed to link services for new provider ID ${provider.id}`, { serviceError });
            // Note: In a real-world scenario, you might want to transactionally roll back the provider creation.
            throw new AppError('Failed to link services to provider.', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    return provider;
  }

  async listProviders(queryParams: ListProvidersQuery) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      searchTerm,
      isActive,
    } = queryParams;

    let query = this.supabase
      .from('providers')
      .select('*', { count: 'exact' });


    if (searchTerm) {
      query = query.or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`
      );
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error, count } = await query;

    if (error) {
      logger.error('Failed to retrieve providers.', { error });
      throw new AppError(
        'Failed to retrieve providers.',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    return {
      data,
      meta: {
        totalItems: count ?? 0,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    };
  }

  async getProviderById(providerId: string): Promise<ProviderWithServices | null> {
    const { data, error } = await this.supabase
      .from('providers')
      .select('*, services:provider_services(service_id)')
      .eq('id', providerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error(`Failed to retrieve provider by ID ${providerId}`, { error });
      throw new AppError(
        'Failed to retrieve provider by ID.',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    
    if (!data) {
        return null;
    }
    
    // Transform the services into a simple array of IDs for the form
    const serviceIds = data.services.map((s: any) => s.service_id);

    return { ...data, serviceIds };
  }

  async updateProvider(
    providerId: string,
    updateData: UpdateProviderBody
  ): Promise<Provider | null> {
    logger.info(`[AdminProviderService] Attempting to update provider ID: ${providerId}`);
    
    const { 
        firstName, 
        lastName, 
        phoneNumber, 
        serviceIds,
        weeklyAvailability,
        specialization,
        licenseNumber,
        credentials,
        bio,
        avatarUrl,
        ...rest 
    } = updateData;

    const payload: any = { ...rest };

    if (firstName) payload.first_name = firstName;
    if (lastName) payload.last_name = lastName;
    if (phoneNumber) payload.contact_number = phoneNumber;
    if (weeklyAvailability) payload.weekly_availability = JSON.stringify(weeklyAvailability);
    if (specialization) payload.specialization = specialization;
    if (licenseNumber) payload.license_number = licenseNumber;
    if (credentials) payload.credentials = credentials;
    if (bio) payload.bio = bio;
    if (avatarUrl) payload.avatar_url = avatarUrl;


    const { data: provider, error } = await this.supabase
      .from('providers')
      .update(payload)
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      logger.error(`[AdminProviderService] Supabase error updating provider ID ${providerId}:`, { error });
      if (error.code === '23505') {
        throw new AppError(
          'A provider with this email already exists.',
          StatusCodes.CONFLICT
        );
      }
      throw new AppError(
        'Failed to update provider.',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    
    if (serviceIds) {
        // First, delete all existing services for this provider
        const { error: deleteError } = await this.supabase.from('provider_services').delete().eq('provider_id', providerId);
        if (deleteError) {
            logger.error(`Failed to update provider services (delete step) for provider ID ${providerId}`, { deleteError });
            throw new AppError('Failed to update provider services (delete step).', StatusCodes.INTERNAL_SERVER_ERROR);
        }

        // Then, insert the new ones
        if (serviceIds.length > 0) {
            const serviceLinks = serviceIds.map(serviceId => ({
                provider_id: providerId,
                service_id: serviceId,
            }));
            const { error: insertError } = await this.supabase.from('provider_services').insert(serviceLinks);
            if (insertError) {
                logger.error(`Failed to update provider services (insert step) for provider ID ${providerId}`, { insertError });
                throw new AppError('Failed to update provider services (insert step).', StatusCodes.INTERNAL_SERVER_ERROR);
            }
        }
    }
    
    if (!provider) {
      logger.warn(`[AdminProviderService] No provider found with ID: ${providerId} to update.`);
      return null;
    }

    logger.info(`[AdminProviderService] Successfully updated provider ID: ${providerId}`);
    return provider;
  }

  async deleteProvider(providerId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('providers')
      .delete({ count: 'exact' })
      .eq('id', providerId);

    if (error) {
       logger.error(`Failed to delete provider ID ${providerId}`, { error });
      throw new AppError(
        'Failed to delete provider.',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    
    if (count === 0) {
        logger.warn(`Attempted to delete non-existent provider ID: ${providerId}`);
    }

    return count ? count > 0 : false;
  }
} 