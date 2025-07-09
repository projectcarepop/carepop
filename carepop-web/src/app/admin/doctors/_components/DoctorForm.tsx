'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Doctor } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useQuery } from '@tanstack/react-query';
import { getAdminClinicsList, getDoctorServiceAssignments, getClinicDetails } from '@/services/api';
import { Clinic, Service } from '@/lib/types/bookings';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  specialtyText: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean(),
  clinicIds: z.array(z.string()).min(1, "Doctor must be assigned to at least one clinic."),
  serviceAssignments: z.any().optional(),
});

type DoctorFormValues = z.infer<typeof formSchema>;

interface DoctorFormProps {
  initialData?: Doctor & { 
      doctorClinics?: { clinicId: string }[],
      doctorClinicServices?: any[], // Note: 'any' is used for now, can be tightened
  };
  defaultClinicId?: string;
  onSubmit: (values: any) => void;
  isPending: boolean;
}

// A component to manage services for a single clinic
const ClinicServiceSelector = ({
    clinic,
    control,
}: {
    clinic: Clinic;
    control: any;
}) => {
    const { data: clinicDetails, isLoading } = useQuery({
        queryKey: ['clinicDetails', clinic.id],
        queryFn: () => getClinicDetails(clinic.id),
        enabled: !!clinic.id,
    });

    const allServicesForClinic = clinicDetails?.services || [];
    const fieldName = `serviceAssignments.${clinic.id}`;

    return (
        <div key={clinic.id} className="space-y-4 rounded-md border p-4">
            <h4 className="font-semibold">{clinic.name} Services</h4>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> :
                <FormField
                    control={control}
                    name={fieldName}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select services this doctor provides at this clinic</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        Select services...
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search services..." />
                                        <CommandList>
                                            <CommandEmpty>No services found for this clinic.</CommandEmpty>
                                            <CommandGroup>
                                                {allServicesForClinic.map((service: Service) => (
                                                    <CommandItem
                                                        key={service.id}
                                                        value={service.name}
                                                        onSelect={() => {
                                                            const currentIds = field.value || [];
                                                            const newIds = currentIds.includes(service.id)
                                                                ? currentIds.filter((id: string) => id !== service.id)
                                                                : [...currentIds, service.id];
                                                            field.onChange(newIds);
                                                        }}
                                                    >
                                                         <Check
                                                            className={cn(
                                                            "mr-2 h-4 w-4",
                                                            (field.value || []).includes(service.id) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span>{service.name}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            }
        </div>
    );
};


export function DoctorForm({
  initialData,
  defaultClinicId,
  onSubmit,
  isPending,
}: DoctorFormProps) {
  const { session } = useAuth();
  const [open, setOpen] = React.useState(false);

  const { data: clinics, isLoading: isLoadingClinics } = useQuery({
      queryKey: ['adminClinicsList'],
      queryFn: () => getAdminClinicsList(session!.access_token),
      enabled: !!session,
  });

   const { data: initialAssignments, isLoading: isLoadingAssignments } = useQuery({
        queryKey: ['doctorServiceAssignments', initialData?.id],
        queryFn: () => getDoctorServiceAssignments(initialData!.id, session!.access_token),
        enabled: !!initialData?.id && !!session,
    });

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fullName: initialData?.fullName || '',
        specialtyText: initialData?.specialtyText || '',
        bio: initialData?.bio || '',
        isActive: initialData?.isActive ?? true,
        clinicIds: initialData?.doctorClinics?.map(c => c.clinicId) || (defaultClinicId ? [defaultClinicId] : []),
        serviceAssignments: {},
    },
  });

  // Watch the assigned clinics to dynamically render selectors
  const assignedClinicIds = form.watch('clinicIds');
  const selectedClinics = React.useMemo(() => {
    return (clinics || []).filter((c: Clinic) => assignedClinicIds.includes(c.id));
  }, [clinics, assignedClinicIds]);


  // When initial assignments are loaded, populate the form
  React.useEffect(() => {
    if (initialAssignments?.data) {
        // The API now returns an array of objects, each with a clinicId and a services array
        const assignmentsForForm = initialAssignments.data.reduce((acc: any, assignment: any) => {
            // assignment is { clinicId: string, clinicName: string, services: {id: string, name: string}[] }
            acc[assignment.clinicId] = assignment.services.map((s: any) => s.id);
            return acc;
        }, {});
        form.setValue('serviceAssignments', assignmentsForForm);
    }
}, [initialAssignments, form]);


  const handleFormSubmit = (values: DoctorFormValues) => {
    const serviceAssignmentsObject = values.serviceAssignments || {};
    const transformedAssignments = Object.entries(serviceAssignmentsObject).map(([clinicId, serviceIds]) => ({
        clinicId,
        serviceIds
    }));
    
    const finalValues = {
        ...values,
        serviceAssignments: transformedAssignments
    };

    onSubmit(finalValues);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Dr. John Doe" {...field} disabled={isPending} />
              </FormControl>
              <FormDescription>
                The doctor&apos;s full name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialtyText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialty</FormLabel>
              <FormControl>
                <Input placeholder="e.g., General Practice, Pediatrics" {...field} disabled={isPending} />
              </FormControl>
              <FormDescription>
                A brief description of the doctor&apos;s specialty.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="A short bio for the doctor..." {...field} disabled={isPending} />
              </FormControl>
              <FormDescription>
                A short biography that will be displayed on public pages.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="clinicIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Clinics</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={isPending || isLoadingClinics}
                  >
                    {isLoadingClinics ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Select clinics...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search clinics..." />
                    <CommandList>
                        <CommandEmpty>No clinics found.</CommandEmpty>
                        <CommandGroup>
                        {(clinics || []).map((clinic: Clinic) => (
                            <CommandItem
                                key={clinic.id}
                                value={clinic.name}
                                onSelect={() => {
                                    const currentIds = field.value || [];
                                    const newIds = currentIds.includes(clinic.id)
                                    ? currentIds.filter(id => id !== clinic.id)
                                    : [...currentIds, clinic.id];
                                    field.onChange(newIds);
                                }}
                            >
                                <Check
                                className={cn(
                                    'mr-2 h-4 w-4',
                                    (field.value || []).includes(clinic.id) ? 'opacity-100' : 'opacity-0'
                                )}
                                />
                                {clinic.name}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the clinics where this doctor will be available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {assignedClinicIds && assignedClinicIds.length > 0 && (
            <div className="space-y-6">
                 <Separator />
                 <div className="space-y-2">
                    <h3 className="text-lg font-medium">Service Assignments</h3>
                    <p className="text-sm text-muted-foreground">
                        Specify which services this doctor provides at each assigned clinic.
                    </p>
                 </div>
                {isLoadingAssignments ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                    selectedClinics.map((clinic: Clinic) => (
                        <ClinicServiceSelector
                            key={clinic.id}
                            clinic={clinic}
                            control={form.control}
                        />
                ))}
            </div>
        )}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  An active doctor can be booked for appointments.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Create Doctor'}
        </Button>
      </form>
    </Form>
  );
}