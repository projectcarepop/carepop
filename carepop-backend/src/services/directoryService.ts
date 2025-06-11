import { supabase } from '../config/supabaseClient';
import logger from '../utils/logger';
// Import a type similar to the frontend's Clinic and Service if you want strong typing for the return
// For now, we'll infer from the query and cast as needed, but a shared type would be better.

// Define the structure expected by the frontend (and as per API_Clinic_List_Implementation_Guide.md)
interface ClinicAPIResponse {
    id: string;
    name: string;
    address: string; 
}

/**
 * Fetches all active clinics with their offered services.
 * This initial version fetches all columns from clinics and assumes services_offered
 * is an array of text or uuids. A more advanced version would perform a proper JOIN
 * to get service names and structure it like the frontend's Clinic.services_offered.
 */
export const fetchAllActiveClinics = async (): Promise<ClinicAPIResponse[]> => {
  console.log('[directoryService.ts] fetchAllActiveClinics service function invoked');
  logger.info('[fetchAllActiveClinics] Fetching all active clinics');
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('id, name, full_address')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      logger.error('[fetchAllActiveClinics] Supabase error:', error);
      throw error;
    }

    logger.info(`[fetchAllActiveClinics] Successfully fetched ${data?.length || 0} clinics from DB.`);
    
    // Map database rows to the API response structure
    return data?.map(clinic => ({
        id: clinic.id,
        name: clinic.name,
        address: clinic.full_address,
    })) || [];

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