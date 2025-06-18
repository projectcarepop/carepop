'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { AutoForm } from '@/components/ui/auto-form';
import { createClinic } from '@/lib/actions/clinic.admin.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const clinicSchema = z.object({
  name: z.string().min(2, { message: "Clinic name must be at least 2 characters." }),
  full_address: z.string().min(10, { message: "Please enter a complete address." }),
  contact_email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  contact_phone: z.string().min(7, { message: "Please enter a valid phone number." }).optional().or(z.literal('')),
  operating_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

export default function NewClinicPage() {
    const router = useRouter();

    const handleSubmit = async (values: z.infer<typeof clinicSchema>) => {
      try {
          const result = await createClinic(values);
          if (!result.success) {
              throw new Error(result.message);
          }
          toast.success(result.message);
          router.push('/admin/clinics');
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          toast.error(errorMessage);
      }
  };

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
      
      <AutoForm
          formSchema={clinicSchema}
          onSubmit={handleSubmit}
          formTitle="Create New Clinic"
          formDescription="Fill out the details below to add a new clinic to the system."
          submitButtonText="Create Clinic"
          fieldConfig={{
              operating_hours: {
                  fieldType: 'textarea',
                  description: 'Enter operating hours, e.g., "Mon-Fri: 9am-5pm, Sat: 10am-2pm".'
              },
               contact_email: {
                  label: "Contact Email"
              },
              contact_phone: {
                  label: "Contact Phone"
              },
              is_active: {
                  label: 'Clinic is Active',
                  description: 'Uncheck this to hide the clinic from public view.'
              }
          }}
      />
    </div>
  );
} 