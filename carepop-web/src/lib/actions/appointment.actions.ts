'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const appointmentFormSchema = z.object({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  serviceId: z.string().uuid(),
  providerId: z.string().uuid(),
  appointmentDateTime: z.string(), // Coming from form as string
  duration: z.string(),
  notes: z.string().optional(),
});

export async function createAppointment(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication Error: You must be logged in to create an appointment.' };
  }

  const validatedFields = appointmentFormSchema.safeParse({
    patientId: formData.get('patientId'),
    clinicId: formData.get('clinicId'),
    serviceId: formData.get('serviceId'),
    providerId: formData.get('providerId'),
    appointmentDateTime: formData.get('appointmentDateTime'),
    duration: formData.get('duration'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { patientId, clinicId, serviceId, providerId, appointmentDateTime, duration, notes } = validatedFields.data;

  const { error } = await supabaseAdmin.from('appointments').insert({
    user_id: patientId,
    clinic_id: clinicId,
    service_id: serviceId,
    provider_id: providerId,
    appointment_datetime: new Date(appointmentDateTime).toISOString(),
    status: 'confirmed',
    duration_minutes: parseInt(duration, 10),
    notes: notes,
    created_by: user.id,
  });

  if (error) {
    console.error('Database Error:', error);
    return { message: `Database Error: Failed to create appointment. ${error.message}` };
  }

  revalidatePath('/admin/appointments');
  redirect('/admin/appointments');
}

export async function cancelAppointment(appointmentId: string, cancellationReason: string) {
  'use server';
  
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Authentication Error: You must be logged in.' };
  }

  // First, verify the user owns the appointment they are trying to cancel
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('id, user_id')
    .eq('id', appointmentId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !appointment) {
    return { success: false, message: 'Error: Appointment not found or you do not have permission to cancel it.' };
  }

  // Now, update the appointment
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ 
      status: 'cancelled_by_user',
      cancellation_reason: cancellationReason,
     })
    .eq('id', appointmentId);

  if (updateError) {
    console.error('Database Error:', updateError);
    return { success: false, message: `Database Error: Failed to cancel appointment. ${updateError.message}` };
  }

  revalidatePath('/appointments'); // Revalidate the user's appointment list
  return { success: true, message: 'Appointment cancelled successfully.' };
} 