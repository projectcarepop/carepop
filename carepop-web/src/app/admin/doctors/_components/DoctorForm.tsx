'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/contexts/auth-context';
import { cn } from '@/lib/utils';
import { getAdminClinicsList, getDoctorServiceContext, assignServicesToDoctor } from '@/services/api';
import { Clinic, Doctor, Service } from '@/lib/types';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { toast } from '@/hooks/use-toast';

// 1. ADDED serviceIds to the schema
const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  specialtyText: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean(),
  clinicId: z.string().uuid('A valid clinic must be selected.').nullable(),
  serviceIds: z.array(z.string()).optional(), // This is the only new field
});

type DoctorFormValues = z.infer<typeof formSchema>;

interface DoctorFormProps {
  initialData?: Doctor & { clinics?: { clinicId: string }[] };
  onSubmit: (values: DoctorFormValues) => Promise<Doctor | void>;
  isSubmitting: boolean;
}

export function DoctorForm({
  initialData,
  onSubmit,
  isSubmitting,
}: DoctorFormProps) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      specialtyText: initialData?.specialtyText || '',
      bio: initialData?.bio || '',
      isActive: initialData?.isActive ?? true,
      clinicId: initialData?.clinics?.[0]?.clinicId || null,
      serviceIds: [], // 2. INITIALIZED serviceIds
    },
  });

  const watchedClinicId = form.watch('clinicId');

  const { data: clinics = [], isLoading: isLoadingClinics } = useQuery<Clinic[]>(
    {
      queryKey: ['adminClinicsList'],
      queryFn: () => getAdminClinicsList(session!.access_token),
      enabled: !!session,
    }
  );

  const { data: serviceContext, isLoading: isLoadingServiceContext } = useQuery({
    queryKey: ['doctorServiceContext', initialData?.id],
    queryFn: () => getDoctorServiceContext(initialData!.id, session!.access_token),
    enabled: !!initialData?.id && !!session,
  });

  const assignServicesMutation = useMutation({
    mutationFn: assignServicesToDoctor,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: "Doctor's services have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['doctorServiceContext', initialData?.id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update services: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  React.useEffect(() => {
    if (serviceContext?.assignedServiceIds) {
      form.setValue('serviceIds', serviceContext.assignedServiceIds);
    }
  }, [serviceContext, form]);

  React.useEffect(() => {
    // When the clinic changes, clear the selected services.
    // The available services will be re-evaluated based on the new context
    // after the doctor is saved and the form is reloaded.
    form.setValue('serviceIds', []);
  }, [watchedClinicId, form]);

  const handleFormSubmit = async (values: DoctorFormValues) => {
    const createdOrUpdatedDoctor = await onSubmit(values);

    if (createdOrUpdatedDoctor && createdOrUpdatedDoctor.id && values.serviceIds) {
      assignServicesMutation.mutate({
        doctorId: createdOrUpdatedDoctor.id,
        serviceIds: values.serviceIds,
        token: session!.access_token,
      });
    }
  };

  const isLoading = isSubmitting || isLoadingClinics || isLoadingServiceContext || assignServicesMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dr. Juan Dela Cruz"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
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
                  <Input
                    placeholder="e.g., General Practice, Pediatrics"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about the doctor"
                  className="resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clinicId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Assigned Clinic</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                      disabled={isLoading}
                    >
                      {field.value
                        ? clinics.find((clinic) => clinic.id === field.value)
                            ?.name
                        : 'Select a clinic...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search clinics..." />
                    <CommandEmpty>No clinic found.</CommandEmpty>
                    <CommandGroup>
                      {clinics.map((clinic) => (
                        <CommandItem
                          key={clinic.id}
                          onSelect={() => {
                            field.onChange(clinic.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              field.value === clinic.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {clinic.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the clinic where this doctor will be available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serviceIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Services</FormLabel>
              <FormControl>
                <MultiSelect
                  options={
                    serviceContext?.availableServices?.map((s: Service) => ({
                      value: s.id,
                      label: s.name,
                    })) || []
                  }
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select services for this doctor"
                  disabled={isLoading || !serviceContext?.availableServices}
                />
              </FormControl>
              <FormDescription>
                Choose the services this doctor can provide at the selected clinic.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  An active doctor can be booked for appointments.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save changes' : 'Create Doctor'}
        </Button>
      </form>
    </Form>
  );
}