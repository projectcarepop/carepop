import { SupabaseClient } from '@supabase/supabase-js';
import { StatusCodes } from 'http-status-codes';
import { Database } from '../../types/supabase';
import { AppError } from '../../utils/errors';
import {
  CreateProviderBody,
  ListProvidersQuery,
  UpdateProviderBody,
} from '../../validation/admin/provider.admin.validation';

type Provider = Database['public']['Tables']['providers']['Row'];

export class AdminProviderService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async createProvider(providerData: CreateProviderBody): Promise<Provider> {
    const { data, error } = await this.supabase
      .from('providers')
      .insert([providerData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError(
          'A provider with this email already exists.',
          StatusCodes.CONFLICT,
          'DATABASE_ERROR',
          { originalError: error }
        );
      }
      throw new AppError(
        'Failed to create provider in database.',
        StatusCodes.INTERNAL_SERVER_ERROR,
        'DATABASE_ERROR',
        { originalError: error }
      );
    }
    return data;
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
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
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
      throw new AppError(
        'Failed to retrieve providers.',
        StatusCodes.INTERNAL_SERVER_ERROR,
        'DATABASE_ERROR',
        { originalError: error }
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

  async getProviderById(providerId: string): Promise<Provider | null> {
    const { data, error } = await this.supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is not an "error" in this context
      throw new AppError(
        'Failed to retrieve provider by ID.',
        StatusCodes.INTERNAL_SERVER_ERROR,
        'DATABASE_ERROR',
        { originalError: error }
      );
    }
    return data;
  }

  async updateProvider(
    providerId: string,
    updateData: UpdateProviderBody
  ): Promise<Provider | null> {
    const { data, error } = await this.supabase
      .from('providers')
      .update(updateData)
      .eq('id', providerId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError(
          'A provider with this email already exists.',
          StatusCodes.CONFLICT,
          'DATABASE_ERROR',
          { originalError: error }
        );
      }
      throw new AppError(
        'Failed to update provider.',
        StatusCodes.INTERNAL_SERVER_ERROR,
        'DATABASE_ERROR',
        { originalError: error }
      );
    }
    return data;
  }

  async deleteProvider(providerId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('providers')
      .delete()
      .eq('id', providerId);

    if (error) {
      throw new AppError(
        'Failed to delete provider.',
        StatusCodes.INTERNAL_SERVER_ERROR,
        'DATABASE_ERROR',
        { originalError: error }
      );
    }
    return true;
  }
} 