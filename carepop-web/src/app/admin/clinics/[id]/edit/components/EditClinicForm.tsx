'use client';

import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'sonner';
import { z } from 'zod';
import { AutoForm } from '@/components/ui/auto-form';
import { updateClinic } from '@/lib/actions/clinic.admin.actions';

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
  full_address: z.string().min(10, "Please enter a complete address."),
  contact_email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  contact_phone: z.string().min(7, "Please enter a valid phone number.").optional().or(z.literal('')),
  operating_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

export function EditClinicForm({ clinic }: { clinic: ClinicData }) {
    const router = useRouter();

    const onSubmit = async (data: any) => {
        try {
            const result = await updateClinic(clinic.id, data);

            if (!result.success) {
                throw new Error(result.message);
            }
            
            toast.success("Clinic updated successfully!");
            router.push('/admin/clinics');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast.error(errorMessage);
        }
    };

    return (
         <AutoForm
            formSchema={clinicSchemaForForm}
            onSubmit={onSubmit}
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