'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Clinic } from '@/lib/types/clinic.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  streetAddress: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  isActive: z.boolean(),
});

type ClinicFormValues = z.infer<typeof formSchema>;

interface ClinicFormProps {
  initialData?: Clinic | null;
  onSubmit: (values: ClinicFormValues) => void;
  isPending: boolean;
}

export const ClinicForm: React.FC<ClinicFormProps> = ({
  initialData,
  onSubmit,
  isPending,
}) => {
  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      streetAddress: initialData?.streetAddress || '',
      locality: initialData?.locality || '',
      region: initialData?.region || '',
      postalCode: initialData?.postalCode || '',
      contactPhone: initialData?.contactPhone || '',
      contactEmail: initialData?.contactEmail || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Clinic' : 'Create a New Clinic'}</CardTitle>
        <CardDescription>Fill out the details below. Required fields are marked with an asterisk (*).</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Clinic Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CarePOP Wellness Center" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Mabini St." {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / Locality</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Malate" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province / Region</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Metro Manila" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1004" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 09171234567" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., contact@carepop.health" {...field} value={field.value ?? ''} />
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
                      Inactive clinics will not appear in public listings or be available for booking.
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
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending} size="lg">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Save Changes' : 'Create Clinic'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}; 