import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

export class AdminDashboardService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseInstance: SupabaseClient<Database>) {
    this.supabase = supabaseInstance;
  }

  async getDashboardStats() {
    try {
      const [clinicsResult, providersResult] = await Promise.all([
        this.supabase.from('clinics').select('id', { count: 'exact', head: true }),
        this.supabase.from('providers').select('id', { count: 'exact', head: true }),
      ]);

      if (clinicsResult.error) {
        logger.error('Error fetching clinics count:', clinicsResult.error);
        throw new AppError('Failed to retrieve clinic statistics.', 500);
      }

      if (providersResult.error) {
        logger.error('Error fetching providers count:', providersResult.error);
        throw new AppError('Failed to retrieve provider statistics.', 500);
      }

      return {
        totalClinics: clinicsResult.count ?? 0,
        totalProviders: providersResult.count ?? 0,
      };
    } catch (error) {
      logger.error('Error in getDashboardStats service:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('An unexpected error occurred while fetching dashboard statistics.', 500);
    }
  }

  async grantAdminRole(userId: string) {
    try {
      const { error } = await this.supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });

      if (error) {
        logger.error(`Error granting admin role to user ${userId}:`, error);
        throw new AppError(`Failed to grant admin role to user ${userId}.`, 500);
      }

      logger.info(`Admin role granted successfully to user ${userId}.`);
      return { success: true, message: `Admin role granted to user ${userId}.` };
    } catch (error) {
      logger.error(`Exception in grantAdminRole for user ${userId}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('An unexpected error occurred while granting admin role.', 500);
    }
  }
} 