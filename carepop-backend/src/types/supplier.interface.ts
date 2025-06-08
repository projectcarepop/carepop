export interface ISupplier {
  id: string;
  name: string;
  contact_person?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
} 