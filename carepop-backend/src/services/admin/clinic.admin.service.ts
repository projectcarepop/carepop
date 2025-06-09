import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types'; // Assuming this will be the correct path after type generation
import { CreateClinicInput, UpdateClinicInput }
  from '../../validation/admin/clinic.admin.validation';
// Comment out direct import if we plan to inject it, or keep for fallback/type
// import { supabaseServiceRole } from '../../config/supabaseClient'; 
import logger from '../../utils/logger'; // Assuming you have a logger utility
import { AppError } from '../../utils/errors';

// Local interface representing a Clinic. 
// Ideally, after types are correctly generated and stable,
// you might use: type Clinic = Database['public']['Tables']['clinics']['Row'];
// Ensure this local interface matches the fields selected and returned by your service methods.
interface Clinic {
  id: string;
  name: string;
  full_address?: string | null;
  street_address?: string | null;
  locality?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website_url?: string | null;
  operating_hours?: string | null;
  services_offered?: string[] | null;
  fpop_chapter_affiliation?: string | null;
  additional_notes?: string | null;
  is_active: boolean | null; 
  created_at: string; 
  updated_at: string; 
  // Removed created_by and updated_by as they are not in the DB schema
}

// Type for the payload used in insert operations, derived from generated types
// After regenerating supabase.types.ts, this will reflect the actual schema.
type ClinicInsertPayload = Database['public']['Tables']['clinics']['Insert'];
// Type for the payload used in update operations, derived from generated types
type ClinicUpdatePayload = Database['public']['Tables']['clinics']['Update'];

// Define an interface for the listClinics options for clarity
export interface ListClinicsOptions {
  page?: number;
  limit?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchByName?: string; // Add other filter/sort options as needed, e.g., searchByName?: string;
}

export class AdminClinicService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseInstance?: SupabaseClient<Database>) {
    if (supabaseInstance) {
      this.supabase = supabaseInstance;
      logger.info('AdminClinicService initialized with injected Supabase client.');
    } else {
      // Fallback or error if direct injection is the primary strategy
      // This path should ideally not be taken if injection works.
      logger.error('AdminClinicService: Supabase client was NOT injected! Attempting to use imported one (this might fail).');
      // Re-enable direct import if this fallback is desired and tested carefully
      // This line WILL cause issues if supabaseServiceRole is undefined at import time.
      // this.supabase = supabaseServiceRole 
      throw new Error('AdminClinicService constructor: Supabase client instance is required.');
    }

    if (!this.supabase || typeof this.supabase.from !== 'function') {
        logger.error('AdminClinicService: Injected Supabase client is invalid or missing .from method.', { supabase: this.supabase });
        throw new Error('AdminClinicService: Injected Supabase client is invalid.');
    }
  }

  async listClinics(options: ListClinicsOptions = {}): Promise<Clinic[]> {
    const { page = 1, limit = 10, isActive, sortBy = 'name', sortOrder = 'asc', searchByName } = options;

    let query = this.supabase
      .from('clinics')
      .select('*');

    // Filtering
    if (typeof isActive === 'boolean') {
      query = query.eq('is_active', isActive);
    }
    if (searchByName && searchByName.trim() !== '') {
      query = query.ilike('name', `%${searchByName.trim()}%`);
    }

    // Sorting - ensure sortBy is a valid column name to prevent errors
    // A more robust solution would involve a whitelist of sortable columns.
    if (sortBy && (sortOrder === 'asc' || sortOrder === 'desc')) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      // Default sort if sortBy/sortOrder is invalid or not provided properly
      query = query.order('name', { ascending: true });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      logger.error('Error listing clinics in Supabase (AdminClinicService):', error);
      throw new Error(`Could not list clinics: ${error.message}`);
    }
    // After regenerating types, if Clinic is Database['public']['Tables']['clinics']['Row'], this cast might not be needed
    // or might need adjustment if the local Clinic interface diverges significantly.
    return (data as Clinic[]) || [];
  }

  async countClinics(options: Pick<ListClinicsOptions, 'isActive' | 'searchByName' /* add other filter options here */> = {}): Promise<number> {
    const { isActive, searchByName } = options;
    let query = this.supabase
      .from('clinics')
      .select('id', { count: 'exact', head: true }); // Only need the count

    // Apply the same filters as in listClinics for accurate counting
    if (typeof isActive === 'boolean') {
      query = query.eq('is_active', isActive);
    }
    if (searchByName && searchByName.trim() !== '') {
      query = query.ilike('name', `%${searchByName.trim()}%`);
    }

    const { error, count } = await query;

    if (error) {
      logger.error('Error counting clinics in Supabase (AdminClinicService):', error);
      throw new Error(`Could not count clinics: ${error.message}`);
    }
    return count || 0;
  }

  async getClinicById(clinicId: string): Promise<Clinic | null> {
    const { data, error } = await this.supabase
      .from('clinics')
      .select('*') // Select all columns
      .eq('id', clinicId)
      .single(); // Expects a single row or null

    if (error) {
      if (error.code !== 'PGRST116') { 
        logger.error(`Error fetching clinic by ID (${clinicId}) from Supabase (AdminClinicService):`, error);
        throw new Error(`Could not fetch clinic by ID ${clinicId}: ${error.message}`);
      }
    }
    return data as Clinic | null; 
  }

  async createClinic(clinicData: CreateClinicInput): Promise<Clinic> {
    const { services_offered, ...restOfClinicData } = clinicData;
    
    const payload: ClinicInsertPayload = {
      ...restOfClinicData,
    };

    const { data: clinic, error } = await this.supabase
      .from('clinics')
      .insert(payload)
      .select('*')
      .single(); 

    if (error || !clinic) {
      logger.error('Error creating clinic in Supabase (AdminClinicService):', error);
      throw new Error(`Could not create clinic: ${error?.message || 'No data returned'}`);
    }

    if (services_offered && services_offered.length > 0) {
        const serviceLinks = services_offered.map(serviceId => ({
            clinic_id: clinic.id,
            service_id: serviceId,
        }));
        const { error: serviceError } = await this.supabase.from('clinic_services').insert(serviceLinks);
        if (serviceError) {
            throw new AppError('Failed to link services to clinic.', 500);
        }
    }

    return clinic as Clinic;
  }

  async updateClinic(clinicId: string, clinicData: UpdateClinicInput): Promise<Clinic | null> {
    logger.info(`[AdminClinicService] updateClinic CALLED for ID: ${clinicId}`);
    const { services_offered, ...restOfClinicData } = clinicData;

    const payload: ClinicUpdatePayload = {
      ...restOfClinicData,
      updated_at: new Date().toISOString(),
    };
    
    try {
      const { data: clinic, error } = await this.supabase
        .from('clinics')
        .update(payload)
        .eq('id', clinicId)
        .select()
        .single();

      if (error) {
        logger.error(`[AdminClinicService] Supabase error updating clinic ID ${clinicId}:`, error);
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      if (services_offered) {
        const { error: deleteError } = await this.supabase.from('clinic_services').delete().eq('clinic_id', clinicId);
        if (deleteError) {
            throw new AppError('Failed to update clinic services (delete step).', 500);
        }

        if (services_offered.length > 0) {
            const serviceLinks = services_offered.map(serviceId => ({
                clinic_id: clinicId,
                service_id: serviceId,
            }));
            const { error: insertError } = await this.supabase.from('clinic_services').insert(serviceLinks);
            if (insertError) {
                throw new AppError('Failed to update clinic services (insert step).', 500);
            }
        }
      }

      if (!clinic) {
        logger.warn(`[AdminClinicService] No data returned from Supabase after update for clinic ID ${clinicId}.`);
        return null;
      }
      
      logger.info(`[AdminClinicService] Clinic ID ${clinicId} updated successfully.`);
      return clinic as Clinic;
    } catch (error) {
      logger.error(`[AdminClinicService] Exception in updateClinic for ID ${clinicId}:`, error);
      // Re-throw the error to be handled by the controller and global error handler
      // Avoid returning null here if it's an unexpected exception, let it propagate
      throw error;
    }
  }

  async deleteClinic(clinicId: string): Promise<{ success: boolean; message?: string }> {
    const existingClinic = await this.getClinicById(clinicId); 
    if (!existingClinic) {
      return { success: false, message: `Clinic with ID ${clinicId} not found.` };
    }

    const { error, count } = await this.supabase
      .from('clinics')
      .delete({ count: 'exact' })
      .eq('id', clinicId);

    if (error) {
      logger.error(`Error deleting clinic ID ${clinicId} from Supabase (AdminClinicService):`, error);
      throw new Error(`Could not delete clinic ${clinicId}: ${error.message}`);
    }

    if (count === 0) {
      return { success: false, message: `Clinic with ID ${clinicId} was not deleted (it may have been deleted by another process).` };
    }
    
    return { success: true };
  }
}

export const getDashboardStats = async (supabase: SupabaseClient<Database>) => {
  try {
    const [clinicsResult, providersResult] = await Promise.all([
      supabase.from('clinics').select('id', { count: 'exact', head: true }),
      supabase.from('providers').select('id', { count: 'exact', head: true }),
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
};

export const grantAdminRole = async (supabase: SupabaseClient<Database>, userId: string) => {
  try {
    const { error } = await supabase
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
}; 