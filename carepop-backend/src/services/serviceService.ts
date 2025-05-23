import { supabase } from '../config/supabaseClient';
// import { Database } from '../types/supabaseDbTypes'; // Assuming client is already typed
import { Service, GetServicesQuery, ClinicService } from '../types/serviceTypes';

/**
 * Fetches a list of active services, optionally filtered by category.
 * @param queryParams - The query parameters, including an optional category.
 * @returns A promise that resolves to an array of Service objects.
 * @throws Error if there's an issue fetching from Supabase.
 */
export const getActiveServices = async (
  queryParams: GetServicesQuery
): Promise<Service[]> => {
  // The supabase client from supabaseClient.ts should be pre-typed with the Database schema.
  // We can reference table and column names directly.
  let queryBuilder = supabase
    .from('services') 
    .select(`
      id,
      name,
      description,
      category,
      typical_duration_minutes,
      requires_provider_assignment,
      additional_details,
      is_active,
      created_at,
      updated_at
    `)
    .eq('is_active', true);

  if (queryParams.category) {
    queryBuilder = queryBuilder.eq('category', queryParams.category);
  }

  queryBuilder = queryBuilder.order('name', { ascending: true });

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching active services:', error);
    throw new Error(`Could not fetch active services: ${error.message}`);
  }

  // Assuming 'data' directly matches 'Service[]' structure after the select.
  // If not, a mapping step would be needed here.
  return data || []; // Return empty array if data is null (though error should catch issues)
};

/**
 * Fetches a list of active services offered by a specific clinic.
 * @param clinicId - The UUID of the clinic.
 * @returns A promise that resolves to an array of ClinicService objects.
 * @throws Error if there's an issue fetching from Supabase or if the clinic is not found.
 */
export const getServicesForClinic = async (
  clinicId: string
): Promise<ClinicService[]> => {
  const { data, error } = await supabase
    .from('clinic_services')
    .select(`
      clinic_specific_price,
      services (
        id,
        name,
        description,
        category,
        typical_duration_minutes,
        requires_provider_assignment,
        additional_details,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq('clinic_id', clinicId)
    .eq('is_offered', true) // Assuming clinic_services has an 'is_offered' field
    .filter('services.is_active', 'eq', true); // Filter on the nested services table

  if (error) {
    console.error(`Error fetching services for clinic ${clinicId}:`, error);
    throw new Error(`Could not fetch services for clinic ${clinicId}: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // Transform the data to match the ClinicService[] structure
  const clinicServices: ClinicService[] = data.map((item: any) => {
    if (!item.services) {
      // This case should ideally not happen if the query is correct and data integrity is maintained
      // but good to handle defensively.
      console.warn('Clinic service item missing nested service data:', item);
      return null; 
    }
    return {
      ...(item.services as Service),
      clinic_specific_price: item.clinic_specific_price,
    };
  }).filter(service => service !== null) as ClinicService[]; // Filter out any nulls from defensive check

  return clinicServices;
}; 