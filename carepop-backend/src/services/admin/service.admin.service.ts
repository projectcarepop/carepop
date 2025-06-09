import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';
import { supabaseServiceRole } from '../../config/supabaseClient';
import { AppError } from '../../utils/errors';

export class ServiceAdminService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabaseServiceRole;
  }

  async getAllServices(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select(`
        id,
        name,
        description,
        cost,
        requirements,
        typical_duration_minutes,
        is_active,
        category:service_categories(id, name)
      `);

    if (error) {
      console.error('Error fetching services:', error);
      throw new AppError('Failed to fetch services from the database.', 500);
    }
    
    // The query returns `category` as an object {id, name}. We can leave it like that
    // or flatten it if needed, but nested is often better for the frontend.
    return data || [];
  }

  async getServiceById(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('services')
      .select(`
        id,
        name,
        description,
        cost,
        requirements,
        typical_duration_minutes,
        is_active,
        category:service_categories(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching service with id ${id}:`, error);
      throw new AppError('Failed to fetch service from the database.', 500);
    }

    if (!data) {
      throw new AppError(`Service with id ${id} not found.`, 404);
    }

    return data;
  }

  async createService(serviceData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      throw new AppError('Failed to create service in the database.', 500);
    }

    return data;
  }

  async updateService(id: string, serviceData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating service with id ${id}:`, error);
      // Handle foreign key violation for category_id if needed, or other specific errors
      throw new AppError('Failed to update service in the database.', 500);
    }
    
    if (!data) {
        throw new AppError(`Service with id ${id} not found.`, 404);
    }

    return data;
  }

  async deleteService(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting service with id ${id}:`, error);
      throw new AppError('Failed to delete service from the database.', 500);
    }
  }
} 