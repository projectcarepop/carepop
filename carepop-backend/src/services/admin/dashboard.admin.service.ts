import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

export class AdminDashboardService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseInstance: SupabaseClient<Database>) {
    this.supabase = supabaseInstance;
  }
//stats
  async getDashboardStats() {
    try {
      // NOTE: The 'appointments' and 'inventory_items' tables do not exist yet.
      // A new migration is required to create them for these stats to work.
      // Assumed 'appointments' schema: { appointment_date: date, status: text }
      // Assumed 'inventory_items' schema: { quantity: integer, reorder_level: integer }

      const today = new Date().toISOString().split('T')[0];

      const [
        clinicsResult, 
        providersResult, 
        servicesResult,
        appointmentsToday,
        pendingAppointmentsCount,
        futureAppointments,
        inventoryAlerts,
        pendingAppointmentsList
      ] = await Promise.all([
        this.supabase.from('clinics').select('id', { count: 'exact', head: true }),
        this.supabase.from('providers').select('id', { count: 'exact', head: true }),
        this.supabase.from('services').select('id', { count: 'exact', head: true }),
        // Query for appointments - will fail until table exists
        (this.supabase.from('appointments') as any).select('id', { count: 'exact', head: true }).eq('appointment_date', today).eq('status', 'confirmed'),
        (this.supabase.from('appointments') as any).select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        (this.supabase.from('appointments') as any).select('id', { count: 'exact', head: true }).gte('appointment_date', today),
        // Query for inventory - will fail until table exists
        (this.supabase.from('inventory_items') as any).select('id', { count: 'exact', head: true }).lte('quantity', 0), // or quantity <= reorder_level
        // Get list of 4 oldest pending appointments
        (this.supabase.from('appointments') as any).select(`
          id, 
          created_at, 
          status,
          patients ( fullName ),
          services ( name )
        `).eq('status', 'pending').order('created_at', { ascending: true }).limit(4)
      ]);

      if (clinicsResult.error) {
        logger.error('Error fetching clinics count:', clinicsResult.error);
        throw new AppError('Failed to retrieve clinic statistics.', 500);
      }

      if (providersResult.error) {
        logger.error('Error fetching providers count:', providersResult.error);
        throw new AppError('Failed to retrieve provider statistics.', 500);
      }
      
      if (servicesResult.error) {
        logger.error('Error fetching services count:', servicesResult.error);
        // Non-critical, so we can default to 0 and not throw
      }
      
      // The following checks will log errors but not throw, allowing the dashboard to partially load.
      if (appointmentsToday.error) logger.error('Error fetching today\'s appointments:', appointmentsToday.error.message);
      if (pendingAppointmentsCount.error) logger.error('Error fetching pending appointments count:', pendingAppointmentsCount.error.message);
      if (futureAppointments.error) logger.error('Error fetching future appointments:', futureAppointments.error.message);
      if (inventoryAlerts.error) logger.error('Error fetching inventory alerts:', inventoryAlerts.error.message);
      if (pendingAppointmentsList.error) logger.error('Error fetching pending appointments list:', pendingAppointmentsList.error.message);


      return {
        totalClinics: clinicsResult.count ?? 0,
        totalProviders: providersResult.count ?? 0,
        totalServices: servicesResult.count ?? 0,
        appointmentsTodayCount: appointmentsToday.count ?? 0,
        pendingAppointmentsCount: pendingAppointmentsCount.count ?? 0,
        futureAppointmentsCount: futureAppointments.count ?? 0,
        inventoryAlertsCount: inventoryAlerts.count ?? 0,
        pendingAppointments: pendingAppointmentsList.data ?? []
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