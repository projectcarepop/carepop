import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ISupplier } from '../../types/supplier.interface';
import { Database } from '../../types/supabase.types';
import { getConfig } from '../../config/config';

type SupplierData = Omit<ISupplier, 'id' | 'created_at' | 'updated_at'>;

export class SupplierAdminService {
  private serviceRoleSupabase: SupabaseClient<Database>;

  constructor(private supabase: SupabaseClient<Database>) {
    const config = getConfig();
    if (!config.supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in the application configuration.');
    }
    // This client uses the service_role key to bypass RLS for admin operations
    this.serviceRoleSupabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  async getAllSuppliers(): Promise<ISupplier[]> {
    const { data, error } = await this.supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getSupplierById(id: string): Promise<ISupplier | null> {
    const { data, error } = await this.supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async createSupplier(supplierData: SupplierData): Promise<ISupplier> {
    const { data, error } = await this.serviceRoleSupabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSupplier(id: string, supplierData: Partial<SupplierData>): Promise<void> {
    const { error } = await this.serviceRoleSupabase
      .from('suppliers')
      .update({ ...supplierData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }

  async deleteSupplier(id: string): Promise<{ message: string }> {
    const { error } = await this.serviceRoleSupabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Supplier deleted successfully.' };
  }
} 