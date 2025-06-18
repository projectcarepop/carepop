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
      .from('provider_facilities')
      .select('providers(id, first_name, last_name)')
      .eq('clinic_id', clinicId);

    if (error) {
      throw error;
    }

    // The data is nested, so we need to process and sort it.
    const providers = data
      .map(item => {
        if (!item.providers) return null;
        return {
          value: item.providers.id,
          label: `${item.providers.first_name} ${item.providers.last_name}`.trim()
        }
      })
      .filter((p): p is { value: string, label: string } => p !== null)
      .sort((a, b) => a.label.localeCompare(b.label));

    return NextResponse.json(providers);
  } catch (error: any) {
    console.error('Error fetching providers for clinic:', error);
    return NextResponse.json({ error: 'Failed to fetch providers', details: error.message }, { status: 500 });
  }
}
