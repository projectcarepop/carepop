import { supabase } from '../config/supabaseClient';
import logger from '../utils/logger';
// Import a type similar to the frontend's Clinic and Service if you want strong typing for the return
// For now, we'll infer from the query and cast as needed, but a shared type would be better.

/**
 * Fetches all active clinics with their offered services.
 * This initial version fetches all columns from clinics and assumes services_offered
 * is an array of text or uuids. A more advanced version would perform a proper JOIN
 * to get service names and structure it like the frontend's Clinic.services_offered.
 */
export const fetchAllActiveClinics = async () => {
  logger.info('[fetchAllActiveClinics] Fetching all active clinics');
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        id,
        name,
        address_street,
        address_barangay,
        address_city,
        address_province,
        address_postal_code,
        full_address,
        latitude,
        longitude,
        contact_phone,
        contact_email,
        operating_hours, 
        services_offered, 
        fpop_chapter_affiliation,
        is_active
      `)
      .eq('is_active', true)
      .order('name', { ascending: true }); // Optional: for consistent ordering

    if (error) {
      logger.error('[fetchAllActiveClinics] Supabase error:', error);
      throw error;
    }

    // TODO: Data transformation to match frontend Clinic.services_offered structure
    // The current `services_offered` column from the 'clinics' table might be an array of service IDs/names.
    // The frontend expects: services_offered?: Array<{ id: string; name: string; }>
    // This transformation would ideally involve fetching service details (names) based on IDs.
    // For now, we return the data as is from the 'clinics' table select.
    // A more robust solution would be a database view or a more complex query here.

    logger.info(`[fetchAllActiveClinics] Successfully fetched ${data?.length || 0} clinics.`);
    return data || [];

  } catch (err) {
    logger.error('[fetchAllActiveClinics] Error fetching active clinics:', err);
    throw err; // Re-throw to be caught by controller
  }
};

// Placeholder for other service functions that might be needed
export const searchClinicsByCriteria = async (criteria: any) => {
  // ... implementation for more complex searches if needed beyond controller logic
  logger.info('[searchClinicsByCriteria] Criteria:', criteria);
  return [];
};

export const findClinicById = async (clinicId: string) => {
  // ... implementation for fetching a single clinic by ID if needed by service layer
  logger.info('[findClinicById] Clinic ID:', clinicId);
  return null;
}; 