'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React from 'react';

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
import { getAdminClinicsList } from '@/services/api';
import { Clinic } from '@/lib/types/bookings';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  specialtyText: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean(),
  clinicIds: z.array(z.string()).optional(),
});

type DoctorFormValues = z.infer<typeof formSchema>;

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
  const [open, setOpen] = React.useState(false);

  const { data: clinics, isLoading: isLoadingClinics } = useQuery({
      queryKey: ['adminClinicsList'],
      queryFn: () => getAdminClinicsList(session!.access_token),
      enabled: !!session,
  });

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fullName: initialData?.fullName || '',
        specialtyText: initialData?.specialtyText || '',
        bio: initialData?.bio || '',
        isActive: initialData?.isActive ?? true,
        clinicIds: initialData?.clinics?.map(c => c.clinicId) || (defaultClinicId ? [defaultClinicId] : []),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  disabled={isPending}
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
                  disabled={isPending}
                />
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
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about the doctor..."
                  className="resize-none"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clinicIds"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Assigned Clinics</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                      disabled={isLoadingClinics}
                    >
                      {field.value && field.value.length > 0
                        ? `${field.value.length} clinic(s) selected`
                        : "Select clinics..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search clinics..." />
                    <CommandEmpty>No clinics found.</CommandEmpty>
                    <CommandGroup>
                      {(clinics || []).map((clinic: Clinic) => (
                        <CommandItem
                          value={clinic.name}
                          key={clinic.id}
                          onSelect={() => {
                            const currentIds = field.value || [];
                            const newIds = currentIds.includes(clinic.id)
                              ? currentIds.filter((id) => id !== clinic.id)
                              : [...currentIds, clinic.id];
                            field.onChange(newIds);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              (field.value || []).includes(clinic.id) ? "opacity-100" : "opacity-0"
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
                Select the clinics where this doctor will be available.
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
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save changes' : 'Create Doctor'}
        </Button>
      </form>
    </Form>
  );
} 