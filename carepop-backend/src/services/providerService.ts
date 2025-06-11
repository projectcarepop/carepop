import { supabase } from '../config/supabaseClient';

// This interface describes the raw data structure we aim to get from Supabase
// It will be transformed by the controller into the frontend DTO/type.
export interface RawProviderDataFromDB {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    accepting_new_patients: boolean | null; // Added
    specialty_name: string | null;
}

/**
 * Fetches active providers associated with a specific clinic AND service.
 */
export const fetchProvidersByClinicAndServiceFromDB = async (clinicId: string, serviceId?: string): Promise<RawProviderDataFromDB[]> => {
    if (!serviceId) {
        // According to the guide, serviceId is required for qualified providers.
        // If service doesn't require provider, this step is skipped on frontend.
        // If called without serviceId when it's expected, return empty or throw.
        console.warn('[ProviderService] fetchProvidersByClinicAndServiceFromDB called without serviceId. Returning empty array.');
        return [];
    }

    // Optimized query: Start from providers, then join what's needed.
    // This is generally more straightforward than starting from schedules if the goal is a list of unique providers.
    let query = supabase
        .from('providers')
        .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            accepting_new_patients,
            is_active,
            provider_facilities!inner (
                clinic_id
            ),
            provider_services!inner (
                service_id,
                is_active
            ),
            provider_specialties (
                specialties (
                    name
                )
            )
        `)
        .eq('is_active', true) // Provider is active
        .eq('provider_facilities.clinic_id', clinicId) // Provider is at the specified clinic
        .eq('provider_services.service_id', serviceId) // Provider offers the specified service
        .eq('provider_services.is_active', true); // The service offering by the provider is active
        // provider_facilities doesn't have an is_active, assume relationship implies active link

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching providers by clinic and service:', error.message);
        throw new Error('Could not fetch providers. ' + error.message);
    }

    if (!data) {
        return [];
    }

    // Transform the data
    const transformedProviders: RawProviderDataFromDB[] = data.map((provider: any) => {
        // Extract the first specialty name, if available
        const specialty = provider.provider_specialties?.[0]?.specialties?.name || null;

        return {
            id: provider.id,
            first_name: provider.first_name || '',
            last_name: provider.last_name || '',
            avatar_url: provider.avatar_url || null,
            accepting_new_patients: provider.accepting_new_patients === null ? false : provider.accepting_new_patients, // Default to false if null
            specialty_name: specialty,
        };
    });
    
    // Ensure unique providers if the joins somehow resulted in duplicates (though `!inner` should handle some of this)
    const uniqueProviders = Array.from(new Map(transformedProviders.map(p => [p.id, p])).values());

    return uniqueProviders;
};

// Original fetchProvidersByClinic (can be deprecated or kept if used elsewhere, but the one above is for the booking flow)
export interface ProviderProfile { // Keeping this for now if other parts of app use it
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    specialty_name: string | null;
}
export const fetchProvidersByClinic = async (clinicId: string, serviceId?: string): Promise<ProviderProfile[]> => {
    // This is the older implementation, the new one is fetchProvidersByClinicAndServiceFromDB
    // For now, let's log a warning if this is called in the context of the booking flow without a serviceId
    // as the booking flow now relies on fetchProvidersByClinicAndServiceFromDB.
    if (serviceId) {
        console.warn("DEPRECATION WARNING: 'fetchProvidersByClinic' called with a serviceId. Consider using 'fetchProvidersByClinicAndServiceFromDB' for the booking flow.");
    } else {
        console.info("'fetchProvidersByClinic' (no serviceId) called - this is okay for general clinic provider lists.");
    }
    // ... (original implementation of fetchProvidersByClinic can remain here or be refactored/removed if no longer needed)
    // For safety, I will paste the original implementation of fetchProvidersByClinic here, but it should be reviewed.
    let query_orig = supabase
        .from('provider_weekly_schedules')
        .select(`
            clinic_id,
            providers:provider_id!inner (
                id,
                first_name,
                last_name,
                is_active,
                user_id,
                provider_specialties (
                    specialties (
                        name
                    )
                ),
                provider_services!inner ( 
                    service_id,
                    is_active
                )
            )
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true) 
        .eq('providers.is_active', true);

    if (serviceId) { // The original had serviceId filtering commented out, re-adding it functionally
        query_orig = query_orig
            .eq('providers.provider_services.service_id', serviceId)
            .eq('providers.provider_services.is_active', true);
    }
    const { data: data_orig, error: error_orig } = await query_orig;
    if (error_orig) {
        console.error('Error fetching providers for clinic (original method):', error_orig.message);
        throw new Error('Could not fetch providers for the clinic (original method). ' + error_orig.message);
    }
    if (!data_orig) return [];
    const transformedProviders_orig = data_orig.reduce((acc: ProviderProfile[], scheduleEntry: any) => {
        const providerData = scheduleEntry.providers;
        if (!providerData) return acc;
        if (acc.find(p => p.id === providerData.id)) return acc;
        const specialty = providerData.provider_specialties?.[0]?.specialties?.name || null;
        acc.push({
            id: providerData.id,
            first_name: providerData.first_name || 'N/A',
            last_name: providerData.last_name || 'N/A',
            avatar_url: null, // Original had this as null
            specialty_name: specialty,
        });
        return acc;
    }, []);
    return transformedProviders_orig;
};

// TODO: Create a simple AppError class if it doesn't exist elsewhere, or refine error handling.
// Example basic AppError:
/*
if (!global.AppError) {
    class AppErrorUtil extends Error {
        public statusCode: number;
        public isOperational: boolean;

        constructor(message: string, statusCode: number) {
            super(message);
            this.statusCode = statusCode;
            this.isOperational = true; // Mark as operational to distinguish from programming errors

            Error.captureStackTrace(this, this.constructor);
        }
    }
    global.AppError = AppErrorUtil;
}
*/ 