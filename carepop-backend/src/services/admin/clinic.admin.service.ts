import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types'; // Assuming this will be the correct path after type generation
import { CreateClinicInput, UpdateClinicInput }
  from '../../validation/admin/clinic.admin.validation';
import { supabaseServiceRole } from '../../config/supabaseClient'; // Corrected import

// Define Clinic type based on your Supabase schema if not already globally available
// This is a placeholder; adjust according to your actual generated types.
// type Clinic = Database['public']['Tables']['clinics']['Row'];
// Assuming Clinic type is already defined or you're using `any` for now.
// For stronger typing, ensure your Supabase types are generated and imported correctly.
interface Clinic extends Record<string, any> { id: string; name: string; is_active?: boolean }

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

    let query = supabaseServiceRole // DIAGNOSTIC: Use imported client directly
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

    return data || [];
  }

  async countClinics(options: Pick<ListClinicsOptions, 'isActive' | 'searchByName' /* add other filter options here */> = {}): Promise<number> {
    const { isActive, searchByName } = options;
    let query = supabaseServiceRole // DIAGNOSTIC: Use imported client directly
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
    const { data, error } = await supabaseServiceRole // DIAGNOSTIC: Use imported client directly
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
    return data; 
  }

  async createClinic(clinicData: CreateClinicInput, creatorUserId: string): Promise<Clinic> {
    const { data, error } = await supabaseServiceRole // DIAGNOSTIC: Use imported client directly
      .from('clinics')
      .insert({ ...clinicData, created_by: creatorUserId, updated_by: creatorUserId })
      .select('*')
      .single(); 

    if (error || !data) {
      console.error('Error creating clinic in Supabase:', error);
      throw new Error(`Could not create clinic: ${error?.message || 'No data returned'}`);
    }
    return data;
  }

  async updateClinic(clinicId: string, clinicData: UpdateClinicInput, updatorUserId: string): Promise<Clinic | null> {
    console.log(`[AdminClinicService] updateClinic CALLED for ID: ${clinicId}, Timestamp: ${new Date().toISOString()}`);
    console.log(`[AdminClinicService] Received clinicData for update:`, clinicData);
    console.log(`[AdminClinicService] Updator User ID: ${updatorUserId}`);

    try {
      const { data, error } = await this.supabase
        .from('clinics')
        .update({ 
          ...clinicData, 
          updated_by: updatorUserId,
          updated_at: new Date().toISOString(), 
        })
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
      
      console.log(`[AdminClinicService] Clinic ID ${clinicId} updated successfully in Supabase. Returned data:`, data);
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

    const { error, count } = await supabaseServiceRole // DIAGNOSTIC: Use imported client directly
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