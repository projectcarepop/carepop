import { z } from 'zod';

export const appointmentReportSchema = z.object({
  appointment_id: z.string().uuid(),
  report_title: z.string().optional().nullable(),
  report_content: z.string().optional().nullable(),
  purpose_of_visit: z.string().optional().nullable(),
  symptoms_reported: z.string().optional().nullable(),
  vitals_blood_pressure: z.string().optional().nullable(),
  vitals_temperature: z.string().optional().nullable(),
  vitals_weight: z.string().optional().nullable(),
  vitals_height: z.string().optional().nullable(),
  vitals_other: z.string().optional().nullable(),
  findings_summary: z.string().optional().nullable(),
  diagnoses: z.string().optional().nullable(),
  recommendations_summary: z.string().optional().nullable(),
  treatment_plan: z.string().optional().nullable(),
  lifestyle_recommendations: z.string().optional().nullable(),
  medications_prescribed: z.string().optional().nullable(),
  tests_ordered: z.string().optional().nullable(),
  referrals: z.string().optional().nullable(),
  follow_up_date: z.string().optional().nullable(),
  follow_up_notes: z.string().optional().nullable(),
  additional_notes: z.string().optional().nullable(),
});

export const createAppointmentReportSchema = appointmentReportSchema;

export const updateAppointmentReportSchema = appointmentReportSchema.partial(); 