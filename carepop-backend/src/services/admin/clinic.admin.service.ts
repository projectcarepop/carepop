import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types'; // Assuming this will be the correct path after type generation
import { CreateClinicInput, UpdateClinicInput }
  from '../../validation/admin/clinic.admin.validation';
import { supabaseServiceRole } from '../../config/supabaseClient'; // Corrected import

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

  constructor() {
    // IMPORTANT: This service uses service_role key.
    // Ensure calling code (controller/middleware) has ALREADY VERIFIED ADMIN ROLE.
    this.supabase = supabaseServiceRole; // Correctly assign the imported client
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
      console.error('Error listing clinics in Supabase:', error);
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
      console.error('Error counting clinics in Supabase:', error);
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
        console.error(`Error fetching clinic by ID (${clinicId}) from Supabase:`, error);
        throw new Error(`Could not fetch clinic by ID ${clinicId}: ${error.message}`);
      }
    }
    return data as Clinic | null; 
  }

  async createClinic(clinicData: CreateClinicInput /* creatorUserId: string - Removed */): Promise<Clinic> {
    // Payload should only contain fields present in ClinicInsertPayload (derived from DB schema)
    const payload: ClinicInsertPayload = {
      ...clinicData, // Spread validated input data
      // created_by and updated_by are removed as they are not in the schema
      // created_at and updated_at are typically handled by DB default (TIMESTAMPTZ NOW())
    };

    const { data, error } = await this.supabase
      .from('clinics')
      .insert(payload)
      .select('*')
      .single(); 

    if (error || !data) {
      console.error('Error creating clinic in Supabase:', error);
      throw new Error(`Could not create clinic: ${error?.message || 'No data returned'}`);
    }
    return data as Clinic;
  }

  async updateClinic(clinicId: string, clinicData: UpdateClinicInput /* updatorUserId: string - Removed */): Promise<Clinic | null> {
    console.log(`[AdminClinicService] updateClinic CALLED for ID: ${clinicId}`);

    // Payload should only contain fields present in ClinicUpdatePayload (derived from DB schema)
    const payload: ClinicUpdatePayload = {
      ...clinicData, // Spread validated input data
      // updated_by is removed as it's not in the schema
      updated_at: new Date().toISOString(), // Explicitly set updated_at, assuming this is desired behavior
    };
    
    try {
      const { data, error } = await this.supabase
        .from('clinics')
        .update(payload)
        .eq('id', clinicId)
        .select()
        .single();

      if (error) {
        console.error(`[AdminClinicService] Supabase error updating clinic ID ${clinicId}:`, error);
        // Consider if specific error codes should lead to different handling or logging
        // For example, if error.code === 'PGRST116' (resource not found), it's a 404 scenario
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw error; // Re-throw other Supabase errors to be caught by controller
      }

      if (!data) {
        console.log(`[AdminClinicService] No data returned from Supabase after update for clinic ID ${clinicId} (implies not found or no change?).`);
        // This case might also indicate the clinic was not found if .single() is used and returns null without an error
        return null;
      }
      
      console.log(`[AdminClinicService] Clinic ID ${clinicId} updated successfully.`);
      return data as Clinic;
    } catch (error) {
      console.error(`[AdminClinicService] Exception in updateClinic for ID ${clinicId}:`, error);
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
      console.error(`Error deleting clinic ID ${clinicId} from Supabase:`, error);
      throw new Error(`Could not delete clinic ${clinicId}: ${error.message}`);
    }

    if (count === 0) {
      return { success: false, message: `Clinic with ID ${clinicId} was not deleted (it may have been deleted by another process).` };
    }
    
    return { success: true };
  }
} 