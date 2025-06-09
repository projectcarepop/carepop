import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';
import { supabaseServiceRole } from '../../config/supabaseClient';
import { AppError } from '../../utils/errors';

export class ServiceCategoryAdminService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabaseServiceRole;
  }

  async getAllServiceCategories(): Promise<any[]> {
    const { data, error } = await (this.supabase as any)
      .from('service_categories')
      .select('id, name, description');

    if (error) {
      console.error('Error fetching service categories:', error);
      throw new AppError('Failed to fetch service categories from the database.', 500);
    }
    
    return data || [];
  }

  async getServiceCategoryById(id: string): Promise<any> {
    const { data, error } = await (this.supabase as any)
      .from('service_categories')
      .select('id, name, description')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching service category with id ${id}:`, error);
      throw new AppError('Failed to fetch service category from the database.', 500);
    }

    if (!data) {
      throw new AppError(`Service category with id ${id} not found.`, 404);
    }

    return data;
  }

  async createServiceCategory(categoryData: any): Promise<any> {
    const { data, error } = await (this.supabase as any)
      .from('service_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating service category:', error);
      throw new AppError('Failed to create service category in the database.', 500);
    }

    return data;
  }

  async updateServiceCategory(id: string, categoryData: any): Promise<any> {
    const { data, error } = await (this.supabase as any)
      .from('service_categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating service category with id ${id}:`, error);
      throw new AppError('Failed to update service category in the database.', 500);
    }
    
    if (!data) {
        throw new AppError(`Service category with id ${id} not found.`, 404);
    }

    return data;
  }

  async deleteServiceCategory(id: string): Promise<void> {
    const { error } = await (this.supabase as any)
      .from('service_categories')
      .delete()
      .eq('id', id);

    if (error) {
      // Check for foreign key violation (e.g., if a service still uses this category)
      if (error.code === '23503') { // foreign_key_violation
        throw new AppError('Cannot delete category as it is still referenced by one or more services.', 409);
      }
      console.error(`Error deleting service category with id ${id}:`, error);
      throw new AppError('Failed to delete service category from the database.', 500);
    }
  }
} 