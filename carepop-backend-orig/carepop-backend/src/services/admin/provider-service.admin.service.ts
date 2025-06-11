import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';
import { supabaseServiceRole } from '../../config/supabaseClient';
import { AppError } from '../../utils/errors';

export class ProviderServiceAdminService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabaseServiceRole;
  }

  async getServicesForProvider(providerId: string): Promise<any[]> {
    const { data, error } = await (this.supabase
      .from('provider_services') as any)
      .select(`
        service:services (
          id,
          name,
          description
        )
      `)
      .eq('provider_id', providerId);

    if (error) {
      console.error(`Error fetching services for provider ${providerId}:`, error);
      throw new AppError('Failed to fetch services for provider.', 500);
    }

    return data.map((item: any) => item.service).filter(Boolean);
  }

  async getProvidersForService(serviceId: string): Promise<any[]> {
    const { data, error } = await (this.supabase
      .from('provider_services') as any)
      .select(`
        provider:providers (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('service_id', serviceId);

    if (error) {
      console.error(`Error fetching providers for service ${serviceId}:`, error);
      throw new AppError('Failed to fetch providers for service.', 500);
    }
    
    return data.map((item: any) => item.provider).filter(Boolean);
  }

  async assignServiceToProvider(providerId: string, serviceId: string): Promise<any> {
    // Check if the assignment already exists to prevent duplicates
    const { data: existing, error: existingError } = await (this.supabase
        .from('provider_services') as any)
        .select('provider_id')
        .eq('provider_id', providerId)
        .eq('service_id', serviceId)
        .maybeSingle();

    if(existingError) {
        console.error('Error checking for existing provider-service link:', existingError);
        throw new AppError('Error verifying provider service assignment.', 500);
    }
    
    if (existing) {
      throw new AppError('This service is already assigned to the provider.', 409); // 409 Conflict
    }

    const { data, error } = await (this.supabase
      .from('provider_services') as any)
      .insert({ provider_id: providerId, service_id: serviceId })
      .select()
      .single();

    if (error) {
      // Could be a foreign key violation if providerId or serviceId is invalid
      console.error(`Error assigning service ${serviceId} to provider ${providerId}:`, error);
      throw new AppError('Failed to assign service to provider.', 500);
    }

    return data;
  }

  async unassignServiceFromProvider(providerId: string, serviceId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('provider_services') as any)
      .delete()
      .eq('provider_id', providerId)
      .eq('service_id', serviceId);

    if (error) {
      console.error(`Error unassigning service ${serviceId} from provider ${providerId}:`, error);
      throw new AppError('Failed to unassign service from provider.', 500);
    }
  }
} 