'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React, { useEffect, useState } from 'react';

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
  isPending,
}: ClinicFormProps) {
  const { session } = useAuth();
  const [allServices, setAllServices] = useState<MultiSelectOption[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);

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
      serviceIds: [],
    },
  });

  useEffect(() => {
    async function fetchAssignedServices() {
      if (initialData?.id && session) {
        setIsServicesLoading(true);
        try {
          const assignedServiceIds = await getAdminClinicServices(initialData.id, session.access_token);
          form.reset({
            ...initialData,
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
        } catch (error) {
          console.error("Failed to fetch assigned services", error);
          toast({ title: "Error", description: "Could not fetch assigned services.", variant: "destructive" });
        } finally {
          setIsServicesLoading(false);
        }
      }
    }
    fetchAssignedServices();
  }, [initialData, session, form]);

  useEffect(() => {
    async function fetchAllServices() {
      if (!session) return;
      setIsServicesLoading(true);
      try {
        const services: Service[] = await getAdminServices(session.access_token);
        setAllServices(services.map(s => ({ value: s.id, label: s.name })));
      } catch (error) {
        console.error("Failed to fetch services", error);
        toast({ title: "Error", description: "Could not fetch the list of services.", variant: "destructive" });
      } finally {
        setIsServicesLoading(false);
      }
    }
    fetchAllServices();
  }, [session]);

  const handleFormSubmit = async (values: ClinicFormValues) => {
    const { serviceIds, ...clinicDataToSubmit } = values;
    
    const updatedClinic = await onSubmit(clinicDataToSubmit);

    if (updatedClinic && serviceIds && session) {
      setIsServicesLoading(true);
      try {
        await assignServicesToClinic(updatedClinic.id, serviceIds, session.access_token);
        toast({ title: "Success", description: "Clinic services updated successfully." });
      } catch (error) {
          console.error("Failed to assign services", error);
          toast({ title: "Error", description: "Could not update the clinic's services.", variant: "destructive" });
      } finally {
          setIsServicesLoading(false);
      }
    } else if (updatedClinic && !serviceIds && session) {
        setIsServicesLoading(true);
        try {
            await assignServicesToClinic(updatedClinic.id, [], session.access_token);
            toast({ title: "Success", description: "All services unassigned from clinic." });
        } catch (error) {
            console.error("Failed to unassign services", error);
            toast({ title: "Error", description: "Could not update the clinic's services.", variant: "destructive" });
        } finally {
            setIsServicesLoading(false);
        }
    }
  };

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
                  disabled={isPending}
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
                  disabled={isPending}
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
                  disabled={isPending}
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
                    disabled={isPending}
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
                  <Input placeholder="1100" {...field} disabled={isPending} />
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
                    disabled={isPending}
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
                    disabled={isPending}
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
              <FormControl>
                <MultiSelect
                  options={allServices}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder={isServicesLoading ? "Loading services..." : "Select services"}
                  className={isServicesLoading ? "cursor-not-allowed" : ""}
                />
              </FormControl>
               <FormDescription>
                  Select all the services offered by this clinic.
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
                  Inactive clinics will not be visible to patients.
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
        <Button type="submit" disabled={isPending || isServicesLoading}>
          {(isPending || isServicesLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save changes' : 'Create Clinic'}
        </Button>
      </form>
    </Form>
  );
} 