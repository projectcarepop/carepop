import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase.types';
import { supabaseServiceRole } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

const supabase: SupabaseClient<Database> = supabaseServiceRole;

export const getServicesForProvider = async (providerId: string) => {
  const { data, error } = await supabase
    .from('provider_services')
    .select('services (*)')
    .eq('provider_id', providerId);

  if (error) {
    throw new AppError(`Failed to fetch services for provider ${providerId}: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return data.map((item) => item.services).filter(Boolean);
};

export const getProvidersForService = async (serviceId: string) => {
  const { data, error } = await supabase
    .from('provider_services')
    .select('providers (*)')
    .eq('service_id', serviceId);

  if (error) {
    throw new AppError(`Failed to fetch providers for service ${serviceId}: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }
    
  return data.map((item) => item.providers).filter(Boolean);
};

export const assignServiceToProvider = async (providerId: string, serviceId: string) => {
  const { data: existing } = await supabase
    .from('provider_services')
    .select('provider_id')
    .eq('provider_id', providerId)
    .eq('service_id', serviceId)
    .maybeSingle();
    
  if (existing) {
    throw new AppError('This service is already assigned to the provider.', StatusCodes.CONFLICT);
  }

  const { data, error } = await supabase
    .from('provider_services')
    .insert({ provider_id: providerId, service_id: serviceId })
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to assign service to provider: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return data;
};

export const unassignServiceFromProvider = async (providerId: string, serviceId: string) => {
  const { error, count } = await supabase
    .from('provider_services')
    .delete({ count: 'exact' })
    .eq('provider_id', providerId)
    .eq('service_id', serviceId);

  if (error) {
    throw new AppError(`Failed to unassign service from provider: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  if (count === 0) {
    throw new AppError('The specified provider-service association does not exist.', StatusCodes.NOT_FOUND);
  }
}; 