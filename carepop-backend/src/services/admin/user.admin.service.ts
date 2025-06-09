import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { StatusCodes } from 'http-status-codes';

// Define a type for the shape of the data returned by the RPC
type UserWithRole = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  role: string | null;
  email: string | null;
}

export class UserAdminService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async listUsers(page: number, limit: number, search?: string, role?: string) {
    const { data, error } = await this.supabase.rpc('search_users', {
        search_term: search || '',
        role_filter: role || '',
        page_num: page,
        page_size: limit,
    });
    
    if (error) {
      console.error('[UserAdminService] RPC Error fetching users:', error);
      throw new AppError('Failed to fetch users via RPC', StatusCodes.INTERNAL_SERVER_ERROR, {
        rpcError: error,
      });
    }

    const users = data || [];
    const totalCount = users.length > 0 ? users[0].total_count : 0;

    return {
      data: users,
      count: totalCount,
    };
  }

  async getUserDetails(userId: string) {
    // Step 1: Get user from auth
    const { data: authUser, error: authError } = await this.supabase.auth.admin.getUserById(userId);
    if (authError) {
      throw new AppError('User not found in auth', StatusCodes.NOT_FOUND);
    }

    // Step 2: Get user profile
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PQRST116 means no rows found, which is ok
      console.error('[UserAdminService] Error fetching profile:', profileError);
      throw new AppError('Error fetching user profile', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Step 3: Get user role
    const { data: roleData, error: roleError } = await this.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError && roleError.code !== 'PGRST116') {
      console.error('[UserAdminService] Error fetching role:', roleError);
      throw new AppError('Error fetching user role', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Step 4: Combine into a final user profile object
    const userProfile = {
      ...(profile || { user_id: userId, first_name: '', last_name: '' }), // Use shell if no profile
      email: authUser.user.email,
      role: roleData?.role || 'user', // Default to 'user' if no role is set
    };
    
    // Step 5: Get appointments
    const { data: appointments, error: appointmentError } = await this.supabase
      .from('appointments')
      .select('*, clinic:clinics (*), service:services (*), provider:providers (*)')
      .eq('user_id', userId)
      .order('appointment_datetime', { ascending: false });

    if (appointmentError) {
      console.error('[UserAdminService] Error fetching appointments:', appointmentError);
      throw new AppError('Failed to fetch appointments', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Step 6: Get medical records
    const { data: medicalRecords, error: medicalRecordsError } = await this.supabase
      .from('user_medical_records')
      .select('*')
      .eq('user_id', userId);

    if (medicalRecordsError) {
      console.error('[UserAdminService] Error fetching medical records:', medicalRecordsError);
      throw new AppError('Failed to fetch medical records', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Step 7: Return final combined data structure
    return { 
      profile: userProfile, 
      appointments: appointments || [], 
      medicalRecords: medicalRecords || [] 
    };
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