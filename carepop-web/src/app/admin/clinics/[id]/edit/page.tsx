import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { EditClinicForm } from './components/EditClinicForm';

async function getClinicById(id: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error(`Error fetching clinic with ID ${id}:`, error);
        notFound();
    }
    
    return {
        id: data.id,
        name: data.name ?? '',
        full_address: data.full_address ?? '',
        contact_email: data.contact_email ?? '',
        contact_phone: data.contact_phone ?? '',
        operating_hours: data.operating_hours ?? '',
        is_active: data.is_active ?? true,
    };
}

export default async function EditClinicPage({ params }: { params: { id:string } }) {
    const clinicData = await getClinicById(params.id);

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <Button variant="outline" asChild>
                <Link href="/admin/clinics">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Clinic List
                </Link>
                </Button>
            </div>
            <EditClinicForm clinic={clinicData} />
        </div>
    );
} 