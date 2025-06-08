export interface IAppointmentReport {
  id: string;
  appointment_id: string;
  
  // Section 2: Purpose of Visit
  purpose_of_visit?: string | null;
  symptoms_reported?: string | null;

  // Section 3: Vitals / Measurements
  vitals_blood_pressure?: string | null;
  vitals_temperature?: string | null;
  vitals_weight?: string | null;
  vitals_height?: string | null;
  vitals_other?: string | null;

  // Section 4: Findings
  findings_summary?: string | null;
  diagnoses?: string | null;

  // Section 5: Recommendations
  recommendations_summary?: string | null;
  treatment_plan?: string | null;
  lifestyle_recommendations?: string | null;
  medications_prescribed?: string | null;

  // Section 6: Tests & Referrals
  tests_ordered?: string | null;
  referrals?: string | null;

  // Section 7: Follow-Up
  follow_up_date?: string | null;
  follow_up_notes?: string | null;

  // Section 8: Questions / Notes
  additional_notes?: string | null;
  
  // Legacy fields - to be deprecated or mapped
  report_title: string;
  report_content: string;

  created_at: string;
  updated_at: string;
} 