'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { type Service, type ServiceCategory } from '@/types/app';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Service name must be at least 2 characters.' }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  duration: z.coerce.number().int().positive({ message: 'Duration must be a positive number of minutes.' }),
  categoryId: z.string({ required_error: 'Please select a category.' }),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  initialData?: Service | null;
  categories: ServiceCategory[];
  onSubmit: (values: ServiceFormValues) => void;
  isSubmitting: boolean;
}

export function ServiceForm({ initialData, categories, onSubmit, isSubmitting }: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      duration: initialData?.duration || 30,
      categoryId: initialData?.categoryId || undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl><Input placeholder="e.g., Annual Check-up" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a category for this service" /></SelectTrigger></FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Describe the service..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price (in PHP)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Duration (in minutes)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Create Service'}
        </Button>
      </form>
    </Form>
  );
} 