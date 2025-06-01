import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types'; // Assuming this will be the correct path after type generation
import { CreateClinicInput, UpdateClinicInput }
  from '../../validation/admin/clinic.admin.validation';
import { supabaseServiceRole } from '../../config/supabaseClient'; // Corrected import

type Clinic = Database['public']['Tables']['clinics']['Row'];

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

  async createClinic(input: CreateClinicInput): Promise<Clinic> {
    let lat: number | undefined = input.latitude;
    let lon: number | undefined = input.longitude;

    if ((!lat || !lon) && input.full_address) {
      console.log(`Geocoding attempt for address: ${input.full_address}`);
      try {
        const { data: geocodeData, error: geocodeError } = await this.supabase.functions.invoke('geocode-address', {
          body: { address: input.full_address },
        });

        if (geocodeError) {
          console.warn('Geocoding error:', geocodeError.message);
        } else if (geocodeData && typeof geocodeData.latitude === 'number' && typeof geocodeData.longitude === 'number') {
          lat = geocodeData.latitude;
          lon = geocodeData.longitude;
          console.log(`Geocoding successful: Lat ${lat}, Lng ${lon}`);
        } else {
          console.warn('Geocoding returned no coordinates or unexpected data.');
        }
      } catch (e: any) {
        console.error('Exception during geocoding invocation:', e.message);
      }
    }

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      console.error('Error: Latitude and Longitude are required and could not be determined.');
      throw new Error('Latitude and Longitude are required and could not be determined. Geocoding might have failed or address was insufficient.');
    }

    // At this point, lat and lon are guaranteed to be numbers.
    // Construct the object for insertion, excluding full_address and ensuring correct types.
    const { full_address, latitude, longitude, ...restOfInput } = input;
    
    const dataToInsert: Database['public']['Tables']['clinics']['Insert'] = {
      ...restOfInput,
      latitude: lat, // Now correctly typed as number
      longitude: lon, // Now correctly typed as number
      name: input.name // Ensure name is explicitly passed if it's not in restOfInput or part of a spread that TS can't infer for some reason (though it should be)
    };

    const { data, error } = await this.supabase
      .from('clinics')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating clinic in Supabase:', error);
      // Consider more specific error handling or custom error types
      throw new Error(`Could not create clinic: ${error.message}`);
    }

    if (!data) {
      throw new Error('Clinic creation returned no data.');
    }
    
    return data;
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

    return data || [];
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
      // If error is due to no rows found (PostgREST code PGRST116), it's not a server error but a "not found" case.
      // .single() handles this by returning data as null without an error object if no rows are found.
      // However, other errors (DB connection, etc.) should be thrown.
      if (error.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but Falsy was found (0 rows)"
        console.error(`Error fetching clinic by ID (${clinicId}) from Supabase:`, error);
        throw new Error(`Could not fetch clinic by ID ${clinicId}: ${error.message}`);
      }
      // If it's PGRST116, data will be null, and we will return null as intended.
    }
    
    return data; // This will be the clinic object or null if not found
  }

  async updateClinic(clinicId: string, input: UpdateClinicInput): Promise<Clinic | null> {
    let updateData = { ...input };
    let newLat: number | undefined = input.latitude;
    let newLon: number | undefined = input.longitude;

    // Geocoding logic if full_address is provided and lat/lon are not (or explicitly being changed via address)
    if (input.full_address && (newLat === undefined || newLon === undefined || input.latitude === undefined)) {
      console.log(`Geocoding attempt for address during update: ${input.full_address}`);
      try {
        const { data: geocodeData, error: geocodeError } = await this.supabase.functions.invoke('geocode-address', {
          body: { address: input.full_address },
        });
        if (geocodeError) {
          console.warn('Geocoding error during update:', geocodeError.message);
        } else if (geocodeData && typeof geocodeData.latitude === 'number' && typeof geocodeData.longitude === 'number') {
          newLat = geocodeData.latitude;
          newLon = geocodeData.longitude;
          console.log(`Geocoding successful during update: Lat ${newLat}, Lng ${newLon}`);
        } else {
          console.warn('Geocoding during update returned no coordinates or unexpected data.');
        }
      } catch (e: any) {
        console.error('Exception during geocoding invocation for update:', e.message);
      }
    }

    // Prepare the final data for Supabase update
    const dataToUpdate: Database['public']['Tables']['clinics']['Update'] = { ...updateData };

    if (newLat !== undefined) dataToUpdate.latitude = newLat;
    if (newLon !== undefined) dataToUpdate.longitude = newLon;

    // full_address is part of UpdateClinicInput and a valid column in clinics table,
    // so it will be passed to Supabase if present in updateData.

    // Important: Ensure that if lat/lon were updated, they are numbers. 
    // The 'Update' type from Supabase allows latitude/longitude to be optional (undefined),
    // but if they ARE provided, they must be numbers.
    // Our logic above ensures newLat/newLon are numbers if they are not undefined.

    const { data, error } = await this.supabase
      .from('clinics')
      .update(dataToUpdate)
      .eq('id', clinicId)
      .select()
      .single(); // To get the updated record back

    if (error) {
      console.error(`Error updating clinic ID ${clinicId} in Supabase:`, error);
      // Could be a not-found error if RLS prevents update or ID doesn't exist, 
      // or other DB errors.
      throw new Error(`Could not update clinic ${clinicId}: ${error.message}`);
    }

    // .single() will return null if no row was found (and thus not updated)
    return data;
  }

  async deleteClinic(clinicId: string): Promise<{ success: boolean; message?: string }> {
    // First, check if the clinic exists to provide a better message if not found,
    // though .delete() itself won't error if the ID doesn't exist (it just deletes 0 rows).
    const existingClinic = await this.getClinicById(clinicId);
    if (!existingClinic) {
      return { success: false, message: `Clinic with ID ${clinicId} not found.` };
    }

    const { error, count } = await this.supabase
      .from('clinics')
      .delete({ count: 'exact' }) // Request count of deleted rows
      .eq('id', clinicId);

    if (error) {
      console.error(`Error deleting clinic ID ${clinicId} from Supabase:`, error);
      throw new Error(`Could not delete clinic ${clinicId}: ${error.message}`);
    }

    if (count === 0) {
      // This case should ideally be caught by the getClinicById check above,
      // but as a safeguard or if RLS/concurrent modification occurs.
      return { success: false, message: `Clinic with ID ${clinicId} was not deleted (it may have been deleted by another process).` };
    }
    
    return { success: true };
  }
} 