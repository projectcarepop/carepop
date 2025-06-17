import React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppointmentTableClient } from './AppointmentTableClient';
import { z } from 'zod';

export interface Appointment {
  id: string;
  status: string;
  appointment_datetime: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  service: {
    name: string;
  } | null;
  provider: {
    first_name: string;
    last_name: string;
  } | null;
}

const appointmentSearchSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    search: z.string().optional(),
    clinicId: z.string().optional(),
});

type GetAppointmentsParams = z.infer<typeof appointmentSearchSchema>;

async function getAppointments(params: GetAppointmentsParams) {
    const supabase = await createSupabaseServerClient();
    
    const { page, per_page, sort, search, clinicId } = params;

    if (!clinicId) {
        return { appointments: [], totalRecords: 0 };
    }
    
    const [sortField, sortOrder] = sort?.split('.') || ['appointment_datetime', 'desc'];
    const offset = (page - 1) * per_page;

    let query = supabase
        .from('appointments')
        .select(`
            id,
            status,
            appointment_datetime,
            user:users_view (
                first_name,
                last_name,
                email
            ),
            service:services (
                name
            ),
            provider:providers (
                first_name,
                last_name
            )
        `, { count: 'exact' })
        .eq('clinic_id', clinicId)
        .range(offset, offset + per_page - 1)
        .order(sortField, { ascending: sortOrder === 'asc' });

    if (search) {
        // A more robust search would use a tsvector. This is a simple placeholder.
        query = query.or(`users_view.first_name.ilike.%${search}%,users_view.last_name.ilike.%${search}%,users_view.email.ilike.%${search}%,services.name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    
    if(error) {
        console.error("Error fetching appointments:", error);
        return { appointments: [], totalRecords: 0 };
    }
    
    return { appointments: data as Appointment[], totalRecords: count ?? 0 };
}

export async function AppointmentTable(props: GetAppointmentsParams) {
    const validatedParams = appointmentSearchSchema.parse(props);
    const { appointments, totalRecords } = await getAppointments(validatedParams);
    
    return (
        <AppointmentTableClient data={appointments} totalRecords={totalRecords} />
    );
} 