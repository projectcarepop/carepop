import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase.types';
import { supabaseServiceRole } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { listProvidersForClinicSchema } from '@/validation/admin/clinic-provider.validation';

type ListProvidersOptions = z.infer<typeof listProvidersForClinicSchema>['query'];

const supabase: SupabaseClient<Database> = supabaseServiceRole;

const checkEntityExists = async (table: 'clinics' | 'providers', id: string) => {
  const { error } = await supabase.from(table).select('id').eq('id', id).single();
  if (error) {
    throw new AppError(`${table.slice(0, -1)} with ID ${id} not found.`, StatusCodes.NOT_FOUND);
  }
};

export const associateProviderWithClinic = async (clinicId: string, providerId: string) => {
  await Promise.all([
    checkEntityExists('clinics', clinicId),
    checkEntityExists('providers', providerId),
  ]);

  const { data: existing } = await supabase
    .from('provider_facilities')
    .select('clinic_id')
    .eq('clinic_id', clinicId)
    .eq('provider_id', providerId)
    .maybeSingle();

  if (existing) {
    throw new AppError(`Provider ${providerId} is already associated with clinic ${clinicId}.`, StatusCodes.CONFLICT);
  }

  const { error: insertError } = await supabase
    .from('provider_facilities')
    .insert({ clinic_id: clinicId, provider_id: providerId });

  if (insertError) {
    throw new AppError(`Could not associate provider: ${insertError.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return { message: `Provider ${providerId} successfully associated with clinic ${clinicId}.` };
};

export const listProvidersForClinic = async (clinicId: string, options: ListProvidersOptions) => {
  await checkEntityExists('clinics', clinicId);
  
  const { page, limit } = options;
  const offset = (page - 1) * limit;

  const { data, error } = await supabase
    .from('provider_facilities')
    .select(`
      provider_id,
      providers (*)
    `)
    .eq('clinic_id', clinicId)
    .range(offset, offset + limit - 1);
    
  if (error) {
    throw new AppError(`Could not list providers: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return data?.map(item => item.providers).filter(Boolean) || [];
};

export const countProvidersForClinic = async (clinicId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('provider_facilities')
    .select('provider_id', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  if (error) {
    throw new AppError(`Could not count providers: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return count || 0;
};

export const disassociateProviderFromClinic = async (clinicId: string, providerId: string) => {
  const { error, count } = await supabase
    .from('provider_facilities')
    .delete({ count: 'exact' })
    .eq('clinic_id', clinicId)
    .eq('provider_id', providerId);

  if (error) {
    throw new AppError(`Could not disassociate provider: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  
  if (count === 0) {
    throw new AppError(`Association for provider ${providerId} and clinic ${clinicId} not found.`, StatusCodes.NOT_FOUND);
  }

  return { message: `Provider ${providerId} successfully disassociated from clinic ${clinicId}.` };
}; 