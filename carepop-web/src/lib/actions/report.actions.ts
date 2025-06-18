'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const reportFormSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  appointment_id: z.string().uuid(),
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
  report_content: z.string().optional().nullable(),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

export type ReportFormState = {
  message: string;
  errors?: Partial<Record<keyof ReportFormData, string[]>>;
  success: boolean;
};

export async function saveAppointmentReport(
  prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: 'Authentication error.',
      errors: { appointment_id: ['You must be logged in.'] },
    };
  }

  // Authorize user
  const { data: userRole, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || userRole?.role !== 'Admin') {
    return {
      success: false,
      message: 'Authorization error: You do not have permission to perform this action.',
    };
  }

  const validatedFields = reportFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...reportData } = validatedFields.data;

  const dataToUpsert = {
    ...reportData,
    report_content: reportData.report_content ?? '',
    created_by_admin_id: user.id,
  };

  const { error } = await supabaseAdmin
    .from('appointment_reports')
    .upsert(dataToUpsert, { onConflict: 'appointment_id' });


  if (error) {
    console.error('Error saving report:', error);
    return {
      success: false,
      message: 'Database error: Could not save the report.',
      errors: { appointment_id: [error.message] },
    };
  }

  revalidatePath(`/admin/appointments/${reportData.appointment_id}/report`);
  
  return {
    success: true,
    message: 'Report saved successfully.',
  };
}
