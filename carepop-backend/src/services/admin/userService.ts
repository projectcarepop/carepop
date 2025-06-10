import { supabaseServiceRole } from 'config/supabaseClient';
import { HttpError } from 'utils/HttpError';
import { z } from 'zod';
import { updateUserSchema } from 'validation/admin/userValidation';

const TABLE_NAME = 'users_view'; // Using the view for reads
const PROFILES_TABLE = 'profiles';
const USER_ROLES_TABLE = 'user_roles';

type UpdateUserDTO = z.infer<typeof updateUserSchema>;

export const userService = {
  getAll: async (searchQuery?: string) => {
    let query = supabaseServiceRole.from(TABLE_NAME).select('*');

    if (searchQuery) {
      query = query.ilike('full_name', `%${searchQuery}%`);
    }
    const { data, error } = await query;
    if (error) throw new HttpError('Failed to fetch users.', 500);
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).select('*').eq('id', id).single();
     if (error) { throw new HttpError('User not found.', 404); }
     return data;
  },

  update: async (id: string, userData: UpdateUserDTO) => {
    const { roles, ...profileData } = userData;

    // Update profile if there's data for it
    if (Object.keys(profileData).length > 0) {
        const { error: profileError } = await supabaseServiceRole.from(PROFILES_TABLE).update(profileData).eq('user_id', id);
        if(profileError) { throw new HttpError('Failed to update user profile.', 500); }
    }

    // Update roles if provided
    if (roles) {
        // This is a simple but destructive way to update roles: delete all, then insert new.
        // A more advanced implementation might compare arrays to add/remove specific roles.
        const { error: deleteError } = await supabaseServiceRole.from(USER_ROLES_TABLE).delete().eq('user_id', id);
        if(deleteError) { throw new HttpError('Failed to clear existing user roles.', 500); }

        const newRoles = roles.map(role => ({ user_id: id, role }));
        const { error: insertError } = await supabaseServiceRole.from(USER_ROLES_TABLE).insert(newRoles);
        if(insertError) { throw new HttpError('Failed to assign new roles to user.', 500); }
    }
    
    return await userService.getById(id); // Return the updated user object
  },

  getAppointmentsForUser: async (userId: string, searchQuery?: string) => {
    let query = supabaseServiceRole
      .from('appointments')
      .select('*, service:services(name), clinic:clinics(name), provider:providers(full_name)')
      .eq('user_id', userId);

    if (searchQuery) {
      query = query.ilike('status', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw new HttpError(`Failed to fetch appointments for user ${userId}.`, 500);
    return data;
  },

  getMedicalRecordsForUser: async (userId: string, searchQuery?: string) => {
    let query = supabaseServiceRole
      .from('user_medical_records')
      .select('*')
      .eq('user_id', userId);

    if (searchQuery) {
      query = query.ilike('record_title', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) throw new HttpError(`Failed to fetch medical records for user ${userId}.`, 500);
    return data;
  },
}; 