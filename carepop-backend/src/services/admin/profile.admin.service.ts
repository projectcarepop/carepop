import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';
import { supabaseServiceRole } from '../../config/supabaseClient';
import { AppError } from '../../utils/errors';

export class ProfileAdminService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabaseServiceRole;
  }

  async getAllProfiles(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('user_id, full_name');

    if (error) {
      console.error('Error fetching profiles:', error);
      throw new AppError('Failed to fetch profiles from the database.', 500);
    }
    
    return data || [];
  }
} 