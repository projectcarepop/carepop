import { supabase } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import cacheService from '@/lib/services/cache.service';

const CLINICS_CACHE_KEY = 'public_clinics_list';
const CACHE_TTL_SECONDS = 300; // 5 minutes

export const getPublicClinics = async () => {
  const cachedClinics = cacheService.get<any[]>(CLINICS_CACHE_KEY);
  if (cachedClinics) {
    return cachedClinics;
  }

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw new AppError(`Supabase error fetching public clinics: ${error.message}`, 500);
  }

  cacheService.set(CLINICS_CACHE_KEY, data, CACHE_TTL_SECONDS);
  return data;
}; 