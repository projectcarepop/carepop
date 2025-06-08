export interface IAppointmentReport {
  id: string;
  appointment_id: string;
  report_title?: string | null;
  report_content?: string | null;
  created_at: string;
  updated_at: string;
  purpose_of_visit?: string | null;
  symptoms_reported?: string | null;
  vitals_blood_pressure?: string | null;
  vitals_temperature?: string | null;
  vitals_weight?: string | null;
  vitals_height?: string | null;
  vitals_other?: string | null;
  findings_summary?: string | null;
  diagnoses?: string | null;
  recommendations_summary?: string | null;
  treatment_plan?: string | null;
  lifestyle_recommendations?: string | null;
  medications_prescribed?: string | null;
  tests_ordered?: string | null;
  referrals?: string | null;
  follow_up_date?: string | null;
  follow_up_notes?: string | null;
  additional_notes?: string | null;
} 