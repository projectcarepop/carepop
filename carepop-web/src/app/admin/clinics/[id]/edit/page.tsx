import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { EditClinicForm } from './components/EditClinicForm';

async function getClinicById(id: string) {
    console.log("--- Debugging Admin Edit Page ---");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Check for the correct key first, but fall back to the common typo.
    let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let keyUsed = 'SUPABASE_SERVICE_ROLE_KEY';

    if (!serviceKey) {
        console.log(`'SUPABASE_SERVICE_ROLE_KEY' not found. Checking for 'NEXT_SUPABASE_ROLE_KEY'...`);
        serviceKey = process.env.NEXT_SUPABASE_ROLE_KEY;
        keyUsed = 'NEXT_SUPABASE_ROLE_KEY';
    }

    if (serviceKey) {
        console.log(`Found service key using variable: '${keyUsed}'`);
    } else {
        console.error("Critical: No Supabase service key found in any environment variable.");
    }

    if (!supabaseUrl) {
        throw new Error('Server-side Error: Missing environment variable NEXT_PUBLIC_SUPABASE_URL.');
    }
    if (!serviceKey) {
        throw new Error('Server-side Error: Missing SUPABASE_SERVICE_ROLE_KEY. Please ensure this is set in a .env.local file inside the /carepop-web directory and that you have fully RESTARTED the server.');
    }

    // Service role client is needed to bypass RLS for admin functions.
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        notFound();
    }
    
    // Ensure the returned data matches the type expected by the client component
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