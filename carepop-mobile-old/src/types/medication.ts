export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  is_active: boolean;
  created_at: string;
} 