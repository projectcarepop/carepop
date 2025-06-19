import { supabase } from '../../config/supabaseClient';
import { AppError } from '../../lib/utils/appError';
import cacheService from '../../lib/services/cache.service';

const CLINICS_CACHE_KEY = 'public_clinics_list';
const CACHE_TTL_SECONDS = 300; // 5 minutes

export const getPublicClinics = async (lat?: number, lon?: number) => {
  // If no location is provided, try to serve a generic cached list
  if (!lat || !lon) {
    const cachedClinics = cacheService.get<any[]>(CLINICS_CACHE_KEY);
    if (cachedClinics) {
      return cachedClinics;
    }
  }

  // If location is provided, we perform a geospatial query
  if (lat && lon) {
    const { data, error } = await supabase.rpc('get_clinics_by_distance', {
      user_lat: lat,
      user_lon: lon,
    });

    if (error) {
      throw new AppError(`Supabase RPC error fetching clinics by distance: ${error.message}`, 500);
    }
    return data;
  }

  // Fallback for when no location is provided and cache is empty
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new AppError(`Supabase error fetching public clinics: ${error.message}`, 500);
  }

  // Cache the generic, non-location-based list
  cacheService.set(CLINICS_CACHE_KEY, data, CACHE_TTL_SECONDS);
  return data;
};

export const getServicesForClinic = async (clinicId: string) => {
  const cacheKey = `clinic_services_${clinicId}`;
  const cachedServices = cacheService.get<any[]>(cacheKey);
  if (cachedServices) {
    return cachedServices;
  }

  const { data, error } = await supabase
    .from('clinic_services')
    .select(`
      services (
        id,
        name,
        description,
        is_active
      )
    `)
    .eq('clinic_id', clinicId)
    .eq('is_offered', true);

  if (error) {
    throw new AppError(`Supabase error fetching services for clinic: ${error.message}`, 500);
  }
  
  // The result from Supabase is [{ services: {...} }, { services: {...} }]. We need to flatten it.
  const services = data.map(item => item.services).filter(Boolean);

  cacheService.set(cacheKey, services, CACHE_TTL_SECONDS);
  return services;
};

export const getProvidersForServiceInClinic = async (clinicId: string, serviceId: string) => {
    const cacheKey = `clinic_${clinicId}_service_${serviceId}_providers`;
    const cachedData = cacheService.get<any[]>(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // This query finds all providers who are:
    // 1. Linked to the specified clinic_id.
    // 2. Are themselves marked as active.
    // 3. Are linked to the specified service_id through the 'provider_services' join table.
    const { data, error } = await supabase
        .from('clinic_providers')
        .select(`
            providers (
                id,
                full_name,
                specialty,
                photo_url,
                is_accepting_new_patients
            )
        `)
        .eq('clinic_id', clinicId)
        .eq('providers.is_active', true) // Ensure the provider themself is active
        .not('providers', 'is', null) // Ensure the join worked and we don't have empty provider records
        .filter('providers.provider_services.service_id', 'eq', serviceId); // This is a conceptual filter on a join, actual implementation might vary
    
    // The above filter might not work directly as written. A stored procedure is a much better way to handle this join logic.
    // Let's call an RPC function `get_providers_for_service_in_clinic` instead for robustness.

    const { data: rpcData, error: rpcError } = await supabase.rpc('get_providers_for_service_in_clinic', {
        p_clinic_id: clinicId,
        p_service_id: serviceId
    });

    if (rpcError) {
        throw new AppError(`Supabase RPC error fetching providers: ${rpcError.message}`, 500);
    }
    
    cacheService.set(cacheKey, rpcData, CACHE_TTL_SECONDS);
    return rpcData;
}; 