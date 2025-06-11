import { supabase } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import cacheService from '@/lib/services/cache.service';

const SERVICES_CACHE_KEY = 'public_services_list';
const CACHE_TTL_SECONDS = 3600; // 1 hour

export const getPublicServices = async () => {
  const cachedServices = cacheService.get<any[]>(SERVICES_CACHE_KEY);
  if (cachedServices) {
    return cachedServices;
  }

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new AppError(`Supabase error fetching public services: ${error.message}`, 500);
  }

  cacheService.set(SERVICES_CACHE_KEY, data, CACHE_TTL_SECONDS);
  return data;
}; 