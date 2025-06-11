import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';
import { supabaseServiceRole } from '../../config/supabaseClient';
import { ListProvidersForClinicQuery, ProviderBasicDetails } from '../../validation/admin/clinicProvider.admin.validation';

export class AdminClinicProviderService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    // IMPORTANT: This service uses service_role key.
    // Ensure calling code (controller/middleware) has ALREADY VERIFIED ADMIN ROLE.
    this.supabase = supabaseServiceRole;
  }

  /**
   * Associates an existing provider with a clinic.
   * Creates an entry in the provider_facilities table.
   */
  async associateProviderWithClinic(clinicId: string, providerId: string): Promise<{ success: boolean; message?: string }> {
    // 1. Check if the clinic exists (optional, but good practice)
    const { data: clinic, error: clinicError } = await this.supabase
      .from('clinics')
      .select('id')
      .eq('id', clinicId)
      .maybeSingle();

    if (clinicError) {
      console.error(`Error checking clinic existence (${clinicId}):`, clinicError.message);
      throw new Error(`Error verifying clinic: ${clinicError.message}`);
    }
    if (!clinic) {
      return { success: false, message: `Clinic with ID ${clinicId} not found.` };
    }

    // 2. Check if the provider exists (optional, but good practice)
    const { data: provider, error: providerError } = await this.supabase
      .from('providers')
      .select('id')
      .eq('id', providerId)
      .maybeSingle();

    if (providerError) {
      console.error(`Error checking provider existence (${providerId}):`, providerError.message);
      throw new Error(`Error verifying provider: ${providerError.message}`);
    }
    if (!provider) {
      return { success: false, message: `Provider with ID ${providerId} not found.` };
    }

    // 3. Check if association already exists
    const { data: existingAssociation, error: existingAssociationError } = await this.supabase
      .from('provider_facilities')
      .select('clinic_id, provider_id') // clinic_id after migration
      .eq('clinic_id', clinicId)
      .eq('provider_id', providerId)
      .maybeSingle();

    if (existingAssociationError) {
      console.error('Error checking existing association:', existingAssociationError.message);
      throw new Error(`Error verifying association: ${existingAssociationError.message}`);
    }

    if (existingAssociation) {
      return { success: false, message: `Provider ${providerId} is already associated with clinic ${clinicId}.` };
    }

    // 4. Create the association
    // The table is provider_facilities, and after migration, facility_id column is clinic_id
    const { error: insertError } = await this.supabase
      .from('provider_facilities')
      .insert({
        clinic_id: clinicId, // Ensure this matches the column name in your DB after migration
        provider_id: providerId,
        // created_at is default in DB schema for provider_facilities
      });

    if (insertError) {
      console.error('Error associating provider with clinic:', insertError.message);
      // More specific error handling might be needed (e.g., FK constraint violation if IDs are somehow invalid despite checks)
      throw new Error(`Could not associate provider ${providerId} with clinic ${clinicId}: ${insertError.message}`);
    }

    return { success: true, message: `Provider ${providerId} successfully associated with clinic ${clinicId}.` };
  }

  /**
   * Lists providers for a clinic.
   * @param clinicId The ID of the clinic.
   * @param options The query options for listing providers.
   * @returns A list of ProviderBasicDetails.
   */
  async listProvidersForClinic(
    clinicId: string,
    options: ListProvidersForClinicQuery
  ): Promise<ProviderBasicDetails[]> {
    const { page = 1, limit = 10 } = options;

    // Check if clinic exists first (optional, but good for early exit)
    const { data: clinic, error: clinicError } = await this.supabase
      .from('clinics')
      .select('id')
      .eq('id', clinicId)
      .maybeSingle();

    if (clinicError) {
      console.error(`Error checking clinic existence (${clinicId}) for listing providers:`, clinicError.message);
      throw new Error(`Error verifying clinic before listing providers: ${clinicError.message}`);
    }
    if (!clinic) {
      // Or throw a NotFoundError if you have custom error types
      console.warn(`Attempted to list providers for non-existent clinic: ${clinicId}`);
      return []; // Return empty if clinic not found, or throw an error
    }

    const offset = (page - 1) * limit;

    const { data, error } = await this.supabase
      .from('provider_facilities')
      .select(`
        provider_id,
        providers (
          id,
          user_id,
          first_name,
          last_name,
          credentials,
          contact_email,
          contact_phone,
          is_active
        )
      `)
      .eq('clinic_id', clinicId)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(`Error listing providers for clinic ${clinicId}:`, error.message);
      throw new Error(`Could not list providers for clinic ${clinicId}: ${error.message}`);
    }

    // The data structure from Supabase with a join will be an array of objects where
    // each object has a 'providers' property that is the actual provider object.
    // We need to map this to ProviderBasicDetails[]
    return data?.map(item => {
      if (!item.providers) {
        // This case should ideally not happen if the join is set up correctly
        // and there are no orphaned provider_facilities entries.
        // Log a warning if a provider_facility record exists but the linked provider doesn't.
        console.warn(`Provider facility record found for clinic ${clinicId} but provider data is missing for provider_id ${item.provider_id}`);
        return null; // or handle as an error, or skip
      }
      // Explicitly construct the ProviderBasicDetails object to ensure type safety
      // and handle potential discrepancies if Supabase types are out of sync.
      const providerData = item.providers as any; // Cast to any to bypass strict type checking here
      
      return {
        id: providerData.id,
        user_id: providerData.user_id,
        first_name: providerData.first_name,
        last_name: providerData.last_name,
        credentials: providerData.credentials, // This is the field in question
        contact_email: providerData.contact_email,
        contact_phone: providerData.contact_phone,
        is_active: providerData.is_active,
        // associated_at: item.created_at, // If you add created_at to provider_facilities and want it
      };
    }).filter(Boolean) as ProviderBasicDetails[] || []; // Filter out nulls and ensure array type
  }

  /**
   * Counts providers for a clinic.
   * @param clinicId The ID of the clinic.
   * @returns The count of providers for the clinic.
   */
  async countProvidersForClinic(clinicId: string): Promise<number> {
    // Check if clinic exists first
    const { data: clinic, error: clinicError } = await this.supabase
      .from('clinics')
      .select('id', { count: 'exact', head: true })
      .eq('id', clinicId);
      // Using .single() or .maybeSingle() might be better if you only care about existence not count here

    if (clinicError ) { //PGRST116 is not an error for head:true count query for existence
         if(clinicError.code !== 'PGRST116'){
            console.error(`Error checking clinic existence (${clinicId}) for counting providers:`, clinicError.message);
            throw new Error(`Error verifying clinic before counting providers: ${clinicError.message}`);
         }
    }
    // If clinicData is null after maybeSingle(), or if count is 0, clinic doesn't exist or has no providers.
    // For just counting providers of an existing clinic, proceed.
    // If the clinic itself doesn't exist, count of its providers is 0.
    // A direct count on provider_facilities might be slightly faster if clinic existence is guaranteed elsewhere
    // or if we accept 0 for non-existent clinics.

    const { count, error } = await this.supabase
      .from('provider_facilities')
      .select('provider_id', { count: 'exact', head: true })
      .eq('clinic_id', clinicId);

    if (error) {
      console.error(`Error counting providers for clinic ${clinicId}:`, error.message);
      throw new Error(`Could not count providers for clinic ${clinicId}: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Disassociates a provider from a clinic.
   * Deletes the entry from the provider_facilities table.
   */
  async disassociateProviderFromClinic(clinicId: string, providerId: string): Promise<{ success: boolean; message?: string }> {
    // 1. Check if the association exists before attempting to delete
    const { data: existingAssociation, error: checkError } = await this.supabase
      .from('provider_facilities')
      .select('clinic_id, provider_id') // Column names after migration
      .eq('clinic_id', clinicId)
      .eq('provider_id', providerId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking association for clinic ${clinicId} and provider ${providerId}:`, checkError.message);
      throw new Error(`Could not verify association: ${checkError.message}`);
    }

    if (!existingAssociation) {
      return { success: false, message: `Provider ${providerId} is not associated with clinic ${clinicId}.` };
    }

    // 2. Delete the association
    const { error: deleteError, count } = await this.supabase
      .from('provider_facilities')
      .delete({ count: 'exact' })
      .eq('clinic_id', clinicId)
      .eq('provider_id', providerId);

    if (deleteError) {
      console.error(`Error disassociating provider ${providerId} from clinic ${clinicId}:`, deleteError.message);
      throw new Error(`Could not disassociate provider: ${deleteError.message}`);
    }
    
    if (count === 0) {
      // This might happen if the record was deleted between the check and the delete operation (race condition)
      // Or if the initial check somehow missed it (unlikely with maybeSingle if row was there)
      return { success: false, message: `Association for provider ${providerId} and clinic ${clinicId} was not found for deletion, or already deleted.` };
    }

    return { success: true, message: `Provider ${providerId} successfully disassociated from clinic ${clinicId}.` };
  }
} 