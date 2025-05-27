import { supabase } from '../config/supabaseClient';

export interface ProviderProfile {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    specialty_name: string | null;
}

/**
 * Fetches active providers associated with a specific clinic, including their specialty and avatar.
 */
export const fetchProvidersByClinic = async (clinicId: string): Promise<ProviderProfile[]> => {
    // Querying provider_weekly_schedules and joining providers, then their profiles and specialties.
    // This ensures we only get providers scheduled at the specified clinic.
    const { data, error } = await supabase
        .from('provider_weekly_schedules')
        .select(`
            clinic_id,
            providers:provider_id (
                id,
                is_active,
                user_account:user_id ( 
                    profile_details:profiles ( 
                        first_name,
                        last_name,
                        avatar_url
                    )
                ),
                provider_specialties (
                    specialties (
                        name
                    )
                )
            )
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true) // Schedule entry is active
        .eq('providers.is_active', true); // Provider is active

    if (error) {
        console.error('Error fetching providers for clinic:', error.message);
        throw new Error('Could not fetch providers for the clinic. ' + error.message); 
    }

    if (!data) {
        return [];
    }

    // Transform the data to match ProviderProfile structure
    const transformedProviders = data.reduce((acc: ProviderProfile[], scheduleEntry: any) => {
        const providerData = scheduleEntry.providers;
        if (!providerData) return acc;

        // Check if this provider has already been added to avoid duplicates from multiple schedules
        if (acc.find(p => p.id === providerData.id)) {
            return acc;
        }

        const specialty = providerData.provider_specialties?.[0]?.specialties?.name || null;
        
        // Adjust to use the new nested structure for profile information
        const profileInfo = providerData.user_account?.profile_details;

        acc.push({
            id: providerData.id,
            first_name: profileInfo?.first_name || 'N/A', // Provide fallback for names
            last_name: profileInfo?.last_name || 'N/A',  // Provide fallback for names
            avatar_url: profileInfo?.avatar_url || null,
            specialty_name: specialty,
        });
        return acc;
    }, []);

    return transformedProviders;
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