'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from 'lucide-react';
import { Doctor } from './columns';
import { Clinic } from '../clinics/columns'; // Re-using clinic type
// Assume a Service type is available or define it
type Service = { id: string; name: string; };


// --- Validation Schema ---
const formSchema = z.object({
  fullName: z.string().min(3, "Full name is required."),
  specialty: z.string().min(2, "Specialty is required."),
  // The IDs for the relations
  clinicIds: z.array(z.string()).min(1, "Must be assigned to at least one clinic."),
  serviceIds: z.array(z.string()).min(1, "Must provide at least one service."),
});

type DoctorFormData = z.infer<typeof formSchema>;

interface DoctorFormProps {
    initialData?: Doctor & { clinicIds: string[], serviceIds: string[] }; // Assume initialData includes relation IDs
    onSubmit: (values: DoctorFormData) => void;
    isPending: boolean;
}

export function DoctorForm({ initialData, onSubmit, isPending }: DoctorFormProps) {
    const form = useForm<DoctorFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: initialData?.fullName || '',
            specialty: initialData?.specialty || '',
            clinicIds: initialData?.clinicIds || [],
            serviceIds: initialData?.serviceIds || [],
        },
    });

    // --- Fetch relational data for selectors ---
    const { data: clinics, isLoading: isLoadingClinics } = useQuery<Clinic[]>({
        queryKey: ['allAdminClinics'],
        queryFn: async () => {
            const res = await apiClient.api.admin.clinics.$get();
            if (!res.ok) throw new Error('Failed to fetch clinics');
            const data = await res.json();
            return data.data;
        }
    });

    const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
        queryKey: ['allAdminServices'],
        queryFn: async () => {
            // Placeholder for the actual service API endpoint
            const res = await apiClient.api.admin.services.$get();
            if (!res.ok) throw new Error('Failed to fetch services');
            const data = await res.json();
            return data.data;
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Standard input fields */}
                <FormField name="fullName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="specialty" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Specialty</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                {/* Clinic Multi-Select */}
                <Controller
                    name="clinicIds"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assign to Clinics</FormLabel>
                            {isLoadingClinics ? <p>Loading clinics...</p> : (
                                <ScrollArea className="h-32 w-full rounded-md border p-4">
                                {clinics?.map((clinic) => (
                                    <div key={clinic.id} className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                            id={`clinic-${clinic.id}`}
                                            checked={field.value?.includes(clinic.id)}
                                            onCheckedChange={(checked) => {
                                                const currentIds = field.value || [];
                                                return checked
                                                    ? field.onChange([...currentIds, clinic.id])
                                                    : field.onChange(currentIds.filter((id) => id !== clinic.id));
                                            }}
                                        />
                                        <label htmlFor={`clinic-${clinic.id}`}>{clinic.name}</label>
                                    </div>
                                ))}
                                </ScrollArea>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 {/* Service Multi-Select */}
                 <Controller
                    name="serviceIds"
                    control={form.control}
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>Assign Services</FormLabel>
                             {isLoadingServices ? <p>Loading services...</p> : (
                                <ScrollArea className="h-32 w-full rounded-md border p-4">
                                {services?.map((service) => (
                                    <div key={service.id} className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                            id={`service-${service.id}`}
                                            checked={field.value?.includes(service.id)}
                                            onCheckedChange={(checked) => {
                                                const currentIds = field.value || [];
                                                return checked
                                                    ? field.onChange([...currentIds, service.id])
                                                    : field.onChange(currentIds.filter((id) => id !== service.id));
                                            }}
                                        />
                                        <label htmlFor={`service-${service.id}`}>{service.name}</label>
                                    </div>
                                ))}
                                </ScrollArea>
                             )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Save Changes' : 'Create Doctor'}
                </Button>
            </form>
        </Form>
    )
} 