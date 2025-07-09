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
import { Clinic, Service } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { getAdminServices, assignServicesToClinic, getAdminClinicServices } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phoneNumber: z.string().optional(),
  address: z.object({
    street: z.string().min(2, 'Street must be at least 2 characters.'),
    city: z.string().min(2, 'City must be at least 2 characters.'),
    zip: z.string().min(5, 'ZIP code must be at least 5 characters.'),
  }),
  latitude: z.coerce.number().min(-90, 'Invalid Latitude').max(90, 'Invalid Latitude'),
  longitude: z.coerce.number().min(-180, 'Invalid Longitude').max(180, 'Invalid Longitude'),
  isActive: z.boolean(),
  serviceIds: z.array(z.string()).optional(),
});

type ClinicFormValues = z.infer<typeof formSchema>;

interface ClinicFormProps {
  initialData?: Clinic & { latitude?: number; longitude?: number; serviceIds?: string[] };
  onSubmit: (values: Omit<ClinicFormValues, 'serviceIds'>) => Promise<Clinic | null>;
  isPending: boolean;
}

export function ClinicForm({
  initialData,
  onSubmit,
  isPending: isSubmitting, // Rename to avoid conflict with useQuery's isPending
}: ClinicFormProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch all services using useQuery
  const { data: allServices = [], isLoading: isServicesLoading, isError: isServicesError } = useQuery<MultiSelectOption[]>({
      queryKey: ['adminServices'],
      queryFn: async () => {
          if (!session) return [];
          const services: Service[] = await getAdminServices(session.access_token);
          return services.map(s => ({ value: s.id, label: s.name }));
      },
      enabled: !!session,
      staleTime: 1000 * 60 * 5, // 5 mins
  });

  if (isServicesError) {
      toast({ title: "Error", description: "Could not fetch the list of services.", variant: "destructive" });
  }

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      phoneNumber: initialData?.phoneNumber || '',
      address: {
        street: typeof initialData?.address === 'object' && initialData.address !== null ? (initialData.address as any).street : '',
        city: typeof initialData?.address === 'object' && initialData.address !== null ? (initialData.address as any).city : '',
        zip: typeof initialData?.address === 'object' && initialData.address !== null ? (initialData.address as any).zip : '',
      },
      latitude: initialData?.latitude || 0,
      longitude: initialData?.longitude || 0,
      isActive: initialData?.isActive ?? true,
      serviceIds: initialData?.serviceIds || [],
    },
  });

  // 2. Fetch assigned services for the specific clinic (only in edit mode)
  const { isLoading: isAssignedServicesLoading } = useQuery({
    queryKey: ['adminClinicServices', initialData?.id],
    queryFn: async () => {
        if (!initialData?.id || !session) return null;
        const assignedServiceIds = await getAdminClinicServices(initialData.id, session.access_token);
        // Reset the form with the fetched service IDs
        form.reset({
            ...form.getValues(),
            name: initialData.name,
            phoneNumber: initialData.phoneNumber || '',
            latitude: initialData.latitude || 0,
            longitude: initialData.longitude || 0,
            address: {
              street: typeof initialData.address === 'object' && initialData.address !== null ? (initialData.address as any).street : '',
              city: typeof initialData.address === 'object' && initialData.address !== null ? (initialData.address as any).city : '',
              zip: typeof initialData.address === 'object' && initialData.address !== null ? (initialData.address as any).zip : '',
            },
            serviceIds: assignedServiceIds,
        });
        return assignedServiceIds;
    },
    enabled: !!initialData?.id && !!session, // Only run if we are editing a clinic
    refetchOnWindowFocus: false,
  });


  // 3. Use useMutation for assigning services
  const { mutate: assignServices, isPending: isAssigningServices } = useMutation({
    mutationFn: ({ clinicId, serviceIds }: { clinicId: string, serviceIds: string[] }) => {
        if (!session) throw new Error("Not authenticated");
        return assignServicesToClinic(clinicId, serviceIds, session.access_token);
    },
    onSuccess: () => {
        toast({ title: "Success", description: "Clinic services updated successfully." });
        queryClient.invalidateQueries({ queryKey: ['adminClinicServices', initialData?.id] });
    },
    onError: (error) => {
        console.error("Failed to assign services", error);
        toast({ title: "Error", description: "Could not update the clinic's services.", variant: "destructive" });
    }
  });


  const handleFormSubmit = async (values: ClinicFormValues) => {
    const { serviceIds, ...clinicDataToSubmit } = values;
    
    const updatedClinic = await onSubmit(clinicDataToSubmit);

    if (updatedClinic && serviceIds) {
      assignServices({ clinicId: updatedClinic.id, serviceIds });
    }
  };

  const isLoading = isSubmitting || isServicesLoading || isAssignedServicesLoading || isAssigningServices;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="CarePoP Central Clinic"
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
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 09171234567"
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
          name="address.street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Health St."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Quezon City"
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
            name="address.zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="1100" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 14.6760"
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
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 121.0437"
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
          name="serviceIds"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Services Offered</FormLabel>
                <MultiSelect
                    options={allServices}
                    onChange={field.onChange}
                    selected={field.value || []}
                    placeholder="Select services..."
                    disabled={isLoading}
                />
                <FormDescription>
                    Select the medical services this clinic provides.
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
                  Inactive clinics will not be shown in search results.
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
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {initialData ? 'Save Changes' : 'Create Clinic'}
        </Button>
      </form>
    </Form>
  );
} 