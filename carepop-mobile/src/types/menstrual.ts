export interface Cycle {
  id: string;
  user_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface SymptomLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  symptoms: string[];
  notes: string | null;
  created_at: string;
} 