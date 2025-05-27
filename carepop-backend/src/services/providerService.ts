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
                first_name, 
                last_name,  
                is_active,
                user_id, 
                // Attempt to fetch avatar_url via user_id removed for now to isolate the relationship issue
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

        if (acc.find(p => p.id === providerData.id)) {
            return acc;
        }

        const specialty = providerData.provider_specialties?.[0]?.specialties?.name || null;
        
        // Set avatar_url to null by default as the join is removed
        const avatarUrl = null; 

        acc.push({
            id: providerData.id,
            first_name: providerData.first_name || 'N/A',
            last_name: providerData.last_name || 'N/A',
            avatar_url: avatarUrl, // Will be null for now
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