'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type ProductCategory } from '@/lib/types/inventory';
import { Loader2 } from 'lucide-react';
import React from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  initialData?: ProductCategory;
  onSubmit: (values: FormValues) => void;
  isPending: boolean;
}

export function CategoryForm({
  initialData,
  onSubmit,
  isPending,
}: CategoryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: initialData?.name || '',
        description: initialData?.description || '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
        form.reset({
            name: initialData.name,
            description: initialData.description || '',
        });
    } else {
        form.reset({
            name: '',
            description: '',
        });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Vitamins & Supplements"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of this product category."
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save changes' : 'Create Category'}
        </Button>
      </form>
    </Form>
  );
} 