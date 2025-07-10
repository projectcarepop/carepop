'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
  CommandList,
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
import { getAdminClinicsList } from '@/services/api';
import { Clinic, Doctor } from '@/lib/types';

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  specialtyText: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean(),
  clinicId: z.string().uuid('A valid clinic must be selected.').nullable(),
});

type DoctorFormValues = z.infer<typeof formSchema> & { 
  clinicIds?: string[] 
};

interface DoctorFormProps {
  initialData?: Doctor & { clinics?: { clinicId: string }[] };
  defaultClinicId?: string;
  onSubmit: (values: DoctorFormValues) => void;
  isPending: boolean;
}

export function DoctorForm({
  initialData,
  defaultClinicId,
  onSubmit,
  isPending,
}: DoctorFormProps) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      specialtyText: initialData?.specialtyText || '',
      bio: initialData?.bio || '',
      isActive: initialData?.isActive ?? true,
      clinicId: initialData?.clinics?.[0]?.clinicId || defaultClinicId || null,
    },
  });

  const { data: clinics = [], isLoading: isLoadingClinics } = useQuery<Clinic[]>({
      queryKey: ['adminClinicsList'],
      queryFn: () => getAdminClinicsList(session!.access_token),
      enabled: !!session,
    }
  );

  const handleFormSubmit = (values: DoctorFormValues) => {
    // Transform the single clinicId to clinicIds array for backend compatibility
    const transformedValues = {
      ...values,
      clinicIds: values.clinicId ? [values.clinicId] : []
    };
    onSubmit(transformedValues);
  };

  return (
    <Form {...form} key={initialData?.id || 'new'}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder="e.g. Dr. Juan Dela Cruz"
                  {...field}
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
                  disabled={isPending}
                  placeholder="e.g. General Physician"
                  {...field}
                />
              </FormControl>
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
                <Textarea
                  disabled={isPending}
                  placeholder="A brief background about the doctor."
                  className="resize-none"
                  {...field}
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
              <FormLabel>Primary Clinic</FormLabel>
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
                    >
                      {isLoadingClinics ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {field.value
                        ? clinics.find(
                            (clinic) => clinic.id === field.value
                          )?.name
                        : 'Select clinic'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                  <Command>
                    <CommandInput placeholder="Search clinic..." />
                    <CommandList>
                      <CommandEmpty>No clinic found.</CommandEmpty>
                      <CommandGroup>
                        {clinics.map((clinic) => (
                          <CommandItem
                            value={clinic.name}
                            key={clinic.id}
                            onSelect={() => {
                              form.setValue('clinicId', clinic.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                clinic.id === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
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
                The primary clinic where this doctor practices.
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
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Inactive doctors will not be available for booking.
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
        <Button disabled={isPending} className="ml-auto w-full" type="submit">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Create Doctor'}
        </Button>
      </form>
    </Form>
  );
}