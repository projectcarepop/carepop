import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import logger from '@/utils/logger';
import { supabaseServiceRole } from '@/config/supabaseClient';
import { StatusCodes } from 'http-status-codes';

const supabase: SupabaseClient<Database> = supabaseServiceRole;

export const getDashboardStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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
      supabase.from('clinics').select('id', { count: 'exact', head: true }),
      supabase.from('providers').select('id', { count: 'exact', head: true }),
      supabase.from('services').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).gte('appointment_datetime', today.toISOString()).lt('appointment_datetime', tomorrow.toISOString()).eq('status', 'confirmed'),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending_confirmation'),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).gte('appointment_datetime', today.toISOString()),
      supabase.from('inventory_items').select('id', { count: 'exact', head: true }).lte('quantity_on_hand', 0),
      supabase.from('appointments').select(`
        id, 
        created_at, 
        status,
        profiles!inner ( first_name, last_name ),
        services!inner ( name )
      `).eq('status', 'pending_confirmation').order('created_at', { ascending: true }).limit(4)
    ]);

    if (clinicsResult.error) logger.error('Error fetching clinics count:', clinicsResult.error);
    if (providersResult.error) logger.error('Error fetching providers count:', providersResult.error);
    if (servicesResult.error) logger.error('Error fetching services count:', servicesResult.error);
    if (appointmentsToday.error) logger.error('Error fetching today\'s appointments:', appointmentsToday.error.message);
    if (pendingAppointmentsCount.error) logger.error('Error fetching pending appointments count:', pendingAppointmentsCount.error.message);
    if (futureAppointments.error) logger.error('Error fetching future appointments:', futureAppointments.error.message);
    if (inventoryAlerts.error) logger.error('Error fetching inventory alerts:', inventoryAlerts.error.message);
    if (pendingAppointmentsList.error) {
        logger.error('Error fetching pending appointments list:', pendingAppointmentsList.error.message);
        throw new AppError('Failed to fetch pending appointments.', StatusCodes.INTERNAL_SERVER_ERROR);
    }

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
    throw new AppError('An unexpected error occurred while fetching dashboard statistics.', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const grantAdminRole = async (userId: string) => {
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role: 'Admin' }, { onConflict: 'user_id' });

  if (error) {
    logger.error(`Error granting admin role to user ${userId}:`, error);
    throw new AppError(`Failed to grant admin role to user ${userId}.`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  logger.info(`Admin role granted successfully to user ${userId}.`);
  return { message: `Admin role granted to user ${userId}.` };
}; 