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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phoneNumber: z.string().optional(),
  street: z.string().optional(),
  cityMunicipalityCode: z.string().optional(),
  provinceCode: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.coerce.number().min(-90, 'Invalid Latitude').max(90, 'Invalid Latitude'),
  longitude: z.coerce.number().min(-180, 'Invalid Longitude').max(180, 'Invalid Longitude'),
  isActive: z.boolean(),
});

type ClinicFormValues = z.infer<typeof formSchema>;

interface ClinicFormProps {
  initialData?: any;
  onSubmit: (values: ClinicFormValues) => void;
  isPending: boolean;
}

export function ClinicForm({
  initialData,
  onSubmit,
  isPending,
}: ClinicFormProps) {
  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      phoneNumber: initialData?.phoneNumber || '',
      street: initialData?.street || '',
      cityMunicipalityCode: initialData?.cityMunicipalityCode || '',
      provinceCode: initialData?.provinceCode || '',
      zipCode: initialData?.zipCode || '',
      latitude: initialData?.latitude || initialData?.location?.lat || 0,
      longitude: initialData?.longitude || initialData?.location?.lon || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleFormSubmit = (values: ClinicFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
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
              name="street"
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
                name="provinceCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Metro Manila"
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
                name="cityMunicipalityCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / Municipality</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Quezon City"
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
                name="zipCode"
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
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="rounded-lg border p-4 bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Service Management</h4>
              <p className="text-sm text-blue-800">
                Services and doctor assignments are managed in the dedicated clinic management page. 
                After saving this clinic, use the &quot;View &amp; Manage&quot; action to configure services and assign doctors.
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Inactive clinics will not be available for booking.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-8">
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </div>
      </form>
    </Form>
  );
}