import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { clinicId: string } }
) {
  const clinicId = params.clinicId;

  if (!clinicId) {
    return NextResponse.json({ error: 'Clinic ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('clinic_services')
      .select('services(id, name, typical_duration_minutes)')
      .eq('clinic_id', clinicId);

    if (error) {
      throw error;
    }

    // The data is nested, so we need to flatten, transform, and then sort
    const services = data
      .map(item => item.services)
      .filter(Boolean)
      .map(service => ({
        value: service.id,
        label: service.name,
        duration: service.typical_duration_minutes
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Error fetching services for clinic:', error);
    return NextResponse.json({ error: 'Failed to fetch services', details: error.message }, { status: 500 });
  }
} 