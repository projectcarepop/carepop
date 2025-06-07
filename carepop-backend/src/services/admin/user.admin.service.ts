import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { StatusCodes } from 'http-status-codes';

export class UserAdminService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async listUsers(page: number, limit: number, search?: string, role?: string) {
    // Implementation to be added
    return { users: [], total: 0 };
  }

  async getUserDetails(userId: string) {
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    const { data: appointments, error: appointmentError } = await this.supabase
      .from('appointments')
      .select(`
        *,
        clinic:clinics (*),
        service:services (*),
        provider:providers (*)
      `)
      .eq('user_id', userId)
      .order('appointment_datetime', { ascending: false });

    if (appointmentError) {
      throw new AppError('Failed to fetch appointments', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return { profile, appointments };
  }
} 