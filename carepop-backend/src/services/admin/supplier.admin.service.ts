import { SupabaseClient } from '@supabase/supabase-js';
import { ISupplier } from '../../types/supplier.interface';
import { Database } from '../../types/supabase.types';

type SupplierData = Omit<ISupplier, 'id' | 'created_at' | 'updated_at'>;

export class SupplierAdminService {
  constructor(private supabase: SupabaseClient<Database>) {}

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
    const { data, error } = await this.supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateSupplier(id: string, supplierData: Partial<SupplierData>): Promise<void> {
    const { error } = await this.supabase
      .from('suppliers')
      .update({ ...supplierData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }

  async deleteSupplier(id: string): Promise<{ message: string }> {
    const { error } = await this.supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Supplier deleted successfully.' };
  }
} 