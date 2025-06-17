'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { AutoForm } from '@/components/ui/auto-form';
import { updateClinic } from '@/lib/actions/admin.actions';

// This needs to match the data type passed from the server component
type ClinicData = {
    id: string;
    name: string;
    full_address: string;
    contact_email: string;
    contact_phone: string;
    operating_hours: string;
    is_active: boolean;
};

// Define the schema for the form
const clinicSchemaForForm = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  full_address: z.string().optional(),
  contact_email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  operating_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

export function EditClinicForm({ clinic }: { clinic: ClinicData }) {
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