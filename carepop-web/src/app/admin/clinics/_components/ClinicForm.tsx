'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { Clinic } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phoneNumber: z.string().optional(),
  address: z.object({
    street: z.string().min(2, 'Street must be at least 2 characters.'),
    city: z.string().min(2, 'City must be at least 2 characters.'),
    zip: z.string().min(5, 'ZIP code must be at least 5 characters.'),
  }),
  location: z.object({
    lat: z.coerce.number().min(-90, 'Invalid Latitude').max(90, 'Invalid Latitude'),
    lon: z.coerce.number().min(-180, 'Invalid Longitude').max(180, 'Invalid Longitude'),
  }),
  isActive: z.boolean(),
});

type ClinicFormValues = z.infer<typeof formSchema>;

interface ClinicFormProps {
  initialData?: Clinic;
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
    defaultValues: initialData
      ? {
          name: initialData.name,
          phoneNumber: initialData.phoneNumber || '',
          address: {
            street: typeof initialData.address === 'object' && initialData.address !== null ? (initialData.address as any).street : '',
            city: typeof initialData.address === 'object' && initialData.address !== null ? (initialData.address as any).city : '',
            zip: typeof initialData.address === 'object' && initialData.address !== null ? (initialData.address as any).zip : '',
          },
          location: {
            lat: (initialData.location as any)?.y || 0,
            lon: (initialData.location as any)?.x || 0,
          },
          isActive: initialData.isActive,
        }
      : {
          name: '',
          phoneNumber: '',
          address: {
            street: '',
            city: '',
            zip: '',
          },
          location: {
            lat: 0,
            lon: 0,
          },
          isActive: true,
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            name="location.lat"
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
            name="location.lon"
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
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save changes' : 'Create Clinic'}
        </Button>
      </form>
    </Form>
  );
} 