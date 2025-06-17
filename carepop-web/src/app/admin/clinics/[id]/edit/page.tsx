import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { AutoForm } from '@/components/ui/auto-form';
import { updateClinic } from '@/lib/actions/admin.actions';
import { useToast } from '@/hooks/use-toast';

const clinicSchemaForForm = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  full_address: z.string().optional(),
  contact_email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  operating_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

async function getClinicById(id: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        notFound();
    }
    
    return {
        ...data,
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
            <EditClinicFormClientWrapper clinic={clinicData} />
        </div>
    );
}

function EditClinicFormClientWrapper({ clinic }: { clinic: Awaited<ReturnType<typeof getClinicById>> }) {
    'use client';

    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (values: z.infer<typeof clinicSchemaForForm>) => {
        const result = await updateClinic(clinic.id, values);

        if (result && 'error' in result && result.error) {
             toast({
                title: "Error updating clinic",
                description: (result.error as Error).message || 'An unknown error occurred.',
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success!",
                description: "Clinic has been updated successfully.",
            });
            router.push('/admin/clinics');
            router.refresh();
        }
    };

    return (
         <AutoForm
            formSchema={clinicSchemaForForm}
            onSubmit={handleSubmit}
            initialValues={clinic}
            formTitle="Edit Clinic"
            formDescription={`Now editing details for: ${clinic.name}`}
            submitButtonText="Save Changes"
            fieldConfig={{
                full_address: {
                    fieldType: 'textarea',
                },
                operating_hours: {
                    fieldType: 'textarea',
                    description: 'e.g., "Mon-Fri: 9am-5pm, Sat: 10am-2pm"',
                },
                 is_active: {
                    label: 'Clinic is Active',
                    description: 'Uncheck this to hide the clinic from public view.'
                }
            }}
        />
    );
} 