import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types'; // Assuming this will be the correct path after type generation
import { CreateClinicInput }
  from '../../validation/admin/clinic.admin.validation';
import { supabaseServiceRole } from '../../config/supabaseClient'; // Corrected import

type Clinic = Database['public']['Tables']['clinics']['Row'];

export class AdminClinicService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    // IMPORTANT: This service uses service_role key.
    // Ensure calling code (controller/middleware) has ALREADY VERIFIED ADMIN ROLE.
    this.supabase = supabaseServiceRole; // Correctly assign the imported client
  }

  async createClinic(input: CreateClinicInput): Promise<Clinic> {
    let clinicData = { ...input };

    // Geocoding logic (simplified example)
    if ((!clinicData.latitude || !clinicData.longitude) && clinicData.full_address) {
      console.log(`Geocoding attempt for address: ${clinicData.full_address}`);
      try {
        const { data: geocodeData, error: geocodeError } = await this.supabase.functions.invoke('geocode-address', {
          body: { address: clinicData.full_address },
        });

        if (geocodeError) {
          console.warn('Geocoding error:', geocodeError.message);
          // Decide if this should be a hard error or just a warning
          // For now, we'll proceed without coordinates if geocoding fails
        } else if (geocodeData && geocodeData.latitude && geocodeData.longitude) {
          clinicData.latitude = geocodeData.latitude;
          clinicData.longitude = geocodeData.longitude;
          console.log(`Geocoding successful: Lat ${clinicData.latitude}, Lng ${clinicData.longitude}`);
        } else {
          console.warn('Geocoding returned no coordinates or unexpected data.');
        }
      } catch (e: any) {
        console.error('Exception during geocoding invocation:', e.message);
      }
    }
    
    // Remove full_address if it was only for geocoding and not a direct DB field,
    // or ensure your DB schema can handle it if it's meant to be stored.
    // For this example, assuming full_address is not a direct column in 'clinics' table.
    const { full_address, ...dataToInsert } = clinicData;


    const { data, error } = await this.supabase
      .from('clinics')
      .insert(dataToInsert) // Pass the processed clinicData
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

  // We will add methods for listClinics, getClinicById, updateClinic, deleteClinic later
} 