import { supabase } from '../config/supabaseClient';
// import { Database } from '../types/supabaseDbTypes'; // Assuming client is already typed
import { Service, GetServicesQuery, ClinicService, ServiceCategory } from '../types/serviceTypes';

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
): Promise<ServiceCategory[]> => {
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
  const clinicServicesRaw: any[] = data; // Type as any for raw Supabase data

  const groupedServices: { [key: string]: Service[] } = {};

  clinicServicesRaw.forEach((item) => {
    if (!item.services || !item.services.category) {
      console.warn('Clinic service item missing nested service data or category:', item);
      return;
    }
    const serviceDetail: Service = {
      id: item.services.id,
      name: item.services.name,
      description: item.services.description,
      category: item.services.category,
      typical_duration_minutes: item.services.typical_duration_minutes,
      requires_provider_assignment: item.services.requires_provider_assignment,
      additional_details: item.services.additional_details,
      is_active: item.services.is_active,
      created_at: item.services.created_at,
      updated_at: item.services.updated_at,
      // clinicSpecificPrice: item.clinic_specific_price, // This would make it ClinicService, not Service
    };

    const category = item.services.category as string;
    if (!groupedServices[category]) {
      groupedServices[category] = [];
    }
    groupedServices[category].push(serviceDetail);
  });

  // Convert grouped object to array of ServiceCategory
  const result: ServiceCategory[] = Object.keys(groupedServices).map(categoryName => ({
    category: categoryName,
    services: groupedServices[categoryName].sort((a, b) => a.name.localeCompare(b.name)) // Sort services by name
  })).sort((a,b) => a.category.localeCompare(b.category)); // Sort categories by name

  return result;
}; 