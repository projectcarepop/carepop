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

export const getProvidersForService = async (serviceId: string) => {
    const { data: providerServiceLinks, error: linkError } = await supabase
        .from('provider_services')
        .select('provider_id')
        .eq('service_id', serviceId);

    if (linkError) {
        throw new AppError(`Supabase error fetching provider links: ${linkError.message}`, 500);
    }

    if (!providerServiceLinks || providerServiceLinks.length === 0) {
        return [];
    }

    const providerIds = providerServiceLinks.map(link => link.provider_id);

    const { data: providers, error: providerError } = await supabase
        .from('providers')
        .select('id, first_name, last_name, specialization, avatar_url')
        .in('id', providerIds)
        .eq('is_active', true);

    if (providerError) {
        throw new AppError(`Supabase error fetching providers: ${providerError.message}`, 500);
    }

    return providers;
} 