import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { AppointmentTableClient, Appointment } from './AppointmentTableClient';

// Zod schema for validating search parameters
const appointmentSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().optional().default('appointment_datetime.desc'),
  search: z.string().optional(),
  status: z.string().optional(),
});

type GetAppointmentsParams = z.infer<typeof appointmentSearchSchema>;

// This function now returns data or an error message
async function getAppointments(params: GetAppointmentsParams) {
    const supabase = await createSupabaseServerClient();
    
    const { page, per_page, sort, search } = params;
    const offset = (page - 1) * per_page;
    const [sortField, sortOrder] = sort.split('.');

    let query = supabase
        .from('appointments')
        .select(`
            id,
            status,
            appointment_datetime,
            cancellation_reason,
            user:profiles ( id, first_name, last_name, email ),
            service:services ( id, name ),
            provider:providers ( id, first_name, last_name )
        `, { count: 'exact' })
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range(offset, offset + per_page - 1);

    if (search) {
        query = query.or(`user.first_name.ilike.%${search}%,user.last_name.ilike.%${search}%,user.email.ilike.%${search}%,service.name.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query;
    
    if(error) {
        console.error("Error fetching appointments: ", error);
        // Propagate the error message
        return { appointments: [], totalRecords: 0, error: `Failed to load appointments: ${error.message}` };
    }
    
    return { appointments: data as unknown as Appointment[], totalRecords: count ?? 0, error: null };
}

// The main server component
export async function AppointmentTable(props: GetAppointmentsParams) {
    const validatedParams = appointmentSearchSchema.parse(props);
    const { appointments, totalRecords, error } = await getAppointments(validatedParams);
    
    // Pass the error to the client component
    return (
        <AppointmentTableClient data={appointments} totalRecords={totalRecords} error={error} />
    );
}