import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { appointmentSearchSchema } from '@/lib/validation/appointment.validation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validatedParams = appointmentSearchSchema.safeParse(params);

    if (!validatedParams.success) {
        return NextResponse.json({ error: 'Invalid search parameters', details: validatedParams.error.flatten() }, { status: 400 });
    }
    
    const getAppointmentsFromApi = async (params: z.infer<typeof appointmentSearchSchema>) => {
        const supabase = getSupabaseAdmin();
    
        const { clinicId, searchTerm, page, per_page, sort } = params;
        const [sortBy, sortOrder] = sort.split('.') as [string, 'asc' | 'desc'];

        if (!clinicId) {
            return { appointments: [], totalRecords: 0, error: "Clinic ID is required." };
        }

        const { data, error } = await supabase.rpc('get_admin_appointments_list' as any, {
            p_clinic_id: clinicId,
            p_search_term: searchTerm ?? '',
            p_sort_by: sortBy,
            p_sort_order: sortOrder,
            p_page_num: page,
            p_page_size: per_page
        });
        
        if(error) {
            console.error("Error fetching appointments via RPC: ", JSON.stringify(error, null, 2));
            return { appointments: [], totalRecords: 0, error: "Failed to fetch appointments." };
        }

        const appointments = (data || []).map((item: any) => ({
            id: item.id,
            appointment_datetime: item.appointment_datetime,
            status: item.status,
            user: { full_name: item.user_full_name, email: item.user_email },
            service: { name: item.service_name },
            provider: { full_name: item.provider_name },
            clinic: { name: item.clinic_name }
        }));
        
        const totalRecords = data && data.length > 0 ? Number(data[0].total_records) : 0;
        
        return { appointments, totalRecords, error: null };
    }

    const result = await getAppointmentsFromApi(validatedParams.data);

    if(result.error){
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
} 