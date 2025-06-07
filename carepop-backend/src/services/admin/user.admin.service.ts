import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { StatusCodes } from 'http-status-codes';

type UserProfileWithRole = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
  role: { role: string }[];
};

export class UserAdminService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async listUsers(page: number, limit: number, search?: string, role?: string) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        email,
        created_at,
        role:user_roles!inner(role)
      `, { count: 'exact' })
      .range(from, to);

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (role) {
      query = query.eq('role.role', role);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      throw new AppError('Failed to fetch users', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    
    const profiles = data as UserProfileWithRole[];
    const users = profiles.map(p => ({
      user_id: p.user_id,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      created_at: p.created_at,
      role: p.role[0]?.role || 'user'
    }));


    return { users, total: count || 0 };
  }

  async getUserDetails(userId: string) {
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select(`
        *,
        role:user_roles ( role )
      `)
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    const typedProfile = profile as any;
    const userRole = typedProfile.role[0]?.role || 'user';
    delete typedProfile.role;
    const userProfile = { ...typedProfile, role: userRole };


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

    const { data: medicalRecords, error: medicalRecordsError } = await this.supabase
      .from('user_medical_records')
      .select('*')
      .eq('user_id', userId);

    if (medicalRecordsError) {
      throw new AppError('Failed to fetch medical records', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return { profile: userProfile, appointments, medicalRecords };
  }

  async updateUser(userId: string, userData: { first_name: string; last_name: string; role: string }) {
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .update({
        first_name: userData.first_name,
        last_name: userData.last_name,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (profileError) {
      throw new AppError('Failed to update user profile', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    
    // TODO: Handle role update in user_roles table

    return profile;
  }
} 