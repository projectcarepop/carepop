'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Service, ServiceCategory } from '@/lib/types/service.types';

// This schema should be compatible with the backend validation
const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  durationMinutes: z.coerce.number({invalid_type_error: "Duration must be a number"}).int().positive("Duration must be a positive number"),
  serviceCategoryId: z.string({required_error: "Service Category is required."}).min(1, "Service Category is required"),
  isActive: z.boolean(),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  initialData?: Service | null;
  serviceCategories: ServiceCategory[];
  onSubmit: (values: ServiceFormValues) => void;
  isPending: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  serviceCategories,
  onSubmit,
  isPending,
}) => {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || '',
      durationMinutes: initialData?.durationMinutes || 30,
      serviceCategoryId: initialData?.serviceCategoryId || undefined,
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Service' : 'Create a New Service'}</CardTitle>
        <CardDescription>Fill out the details for the service below. Required fields are marked with an asterisk (*).</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., General Consultation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (in PHP) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (in minutes) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief summary of the service..."
                        className="resize-none"
                        {...field}
                        value={field.value ?? ''}
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
                      Inactive services will not be available for booking.
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
                {initialData ? 'Save Changes' : 'Create Service'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}; 