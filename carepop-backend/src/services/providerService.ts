import { supabase } from '../config/supabaseClient';

export interface ProviderProfile {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    specialty_name: string | null;
}

/**
 * Fetches active providers associated with a specific clinic and optionally by a service,
 * including their specialty and avatar.
 */
export const fetchProvidersByClinic = async (clinicId: string, serviceId?: string): Promise<ProviderProfile[]> => {
    let query = supabase
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
        .eq('is_active', true) // Schedule entry is active
        .eq('providers.is_active', true); // Provider is active

    // TEMP: Comment out serviceId filtering to test base provider fetching for the clinic
    /*
    if (serviceId) {
        query = query
            .eq('providers.provider_services.service_id', serviceId)
            .eq('providers.provider_services.is_active', true); // Ensure the provider-service link is active
    }
    */

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching providers for clinic:', error.message);
        throw new Error('Could not fetch providers for the clinic. ' + error.message);
    }

    if (!data) {
        return [];
    }

    const transformedProviders = data.reduce((acc: ProviderProfile[], scheduleEntry: any) => {
        const providerData = scheduleEntry.providers;
        if (!providerData) return acc;

        // TEMP: Comment out JS-side service check
        /*
        if (serviceId) {
            const offersService = providerData.provider_services?.some((ps: any) => ps.service_id === serviceId && ps.is_active);
            if (!offersService) {
                return acc; // Skip if this provider (despite being scheduled) doesn't match the service criteria after all
            }
        }
        */

        if (acc.find(p => p.id === providerData.id)) {
            return acc;
        }

        const specialty = providerData.provider_specialties?.[0]?.specialties?.name || null;
        const avatarUrl = null; 

        acc.push({
            id: providerData.id,
            first_name: providerData.first_name || 'N/A',
            last_name: providerData.last_name || 'N/A',
            avatar_url: avatarUrl,
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