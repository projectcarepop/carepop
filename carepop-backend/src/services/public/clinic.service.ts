import { supabase } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import cacheService from '@/lib/services/cache.service';

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
    .eq('is_active', true)
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