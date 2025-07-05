'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React from 'react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type InventoryItem, type ProductCategory } from '@/lib/types/inventory';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  itemName: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional(),
  sellingPrice: z.coerce.number().min(0, 'Price must be a positive number.'),
  productCategoryId: z.string().uuid('Please select a valid category.'),
  // isActive is not a direct property anymore, so we remove it from the schema
  // and handle it based on business logic if needed, or add it to the type.
  // For now, we assume all upserted items are active.
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: InventoryItem;
  onSubmit: (values: FormValues) => void;
  isPending: boolean;
  categories: ProductCategory[];
}

export function ProductForm({
  initialData,
  onSubmit,
  isPending,
  categories,
}: ProductFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: initialData?.itemName || '',
      description: initialData?.description || '',
      sellingPrice: initialData?.sellingPrice || 0,
      productCategoryId: initialData?.productCategoryId || '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
        form.reset({
            itemName: initialData.itemName,
            description: initialData.description || '',
            sellingPrice: initialData.sellingPrice || 0,
            productCategoryId: initialData.productCategoryId,
        });
    }
  }, [initialData, categories, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vitamin C 500mg" {...field} disabled={isPending} />
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
                  placeholder="Describe the product..."
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
        <FormField
          control={form.control}
          name="sellingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (PHP)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="150.00" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="productCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* The isActive switch is removed as it's not part of the core InventoryItem schema */}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save changes' : 'Create Product'}
        </Button>
      </form>
    </Form>
  );
} 