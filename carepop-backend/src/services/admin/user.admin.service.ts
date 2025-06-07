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
        created_at,
        user_roles ( role )
      `, { count: 'exact' });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.filter('user_roles.role', 'eq', role);
    }
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[UserAdminService] Error fetching users:', error);
      if (error.code === '42P01') {
        throw new AppError('The user_roles table does not exist or cannot be accessed. Please run migrations.', StatusCodes.INTERNAL_SERVER_ERROR);
      }
      throw new AppError('Failed to fetch users', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const users = data.map((profile: any) => ({
      ...profile,
      role: profile.user_roles?.role || 'user',
      user_roles: undefined,
    }));
    
    return { users, total: count || 0 };
  }

  async getUserDetails(userId: string) {
    const { data: user, error: userError } = await this.supabase.auth.admin.getUserById(userId);

    if (userError) {
      throw new AppError('User not found in auth', StatusCodes.NOT_FOUND);
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select(`
        *,
        user_roles ( role )
      `)
      .eq('user_id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        const shellProfile = {
          user_id: userId,
          first_name: '',
          last_name: '',
          email: user.user?.email || '',
          role: 'user',
        };
        return { profile: shellProfile, appointments: [], medicalRecords: [] };
      }
      throw new AppError('User profile not found', StatusCodes.NOT_FOUND);
    }
    
    const userProfile = {
      ...profile,
      email: user.user?.email,
      role: profile.user_roles?.role || 'user',
    };
    delete (userProfile as any).user_roles;


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

    const { error: roleError } = await this.supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: userData.role }, { onConflict: 'user_id' });

    if (roleError) {
      throw new AppError('Failed to update user role', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return profile;
  }
} 