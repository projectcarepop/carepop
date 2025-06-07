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
      .select('id, name');

    if (error) {
      console.error('Error fetching services:', error);
      throw new AppError('Failed to fetch services from the database.', 500);
    }
    
    return data || [];
  }
} 