'use client';

import * as React from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { type InventoryItem, type ProductCategory } from '@/lib/types/inventory';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  itemName: z.string().min(2, "Item name must be at least 2 characters."),
  productCategoryId: z.string({ required_error: "Please select a category." }),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
  // Add other fields from InventoryItem as needed
});

interface ProductFormProps {
  initialData?: InventoryItem;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isPending: boolean;
  categories: ProductCategory[];
}

export function ProductForm({ initialData, onSubmit, isPending, categories }: ProductFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: initialData?.itemName || '',
      productCategoryId: initialData?.productCategoryId || '',
      price: initialData?.sellingPrice || 0,
      isActive: initialData?.isActive ?? true,
      description: initialData?.description || '',
    },
  });
  
  React.useEffect(() => {
      if (initialData) {
          form.reset({
              itemName: initialData.itemName,
              productCategoryId: initialData.productCategoryId,
              price: initialData.sellingPrice,
              isActive: initialData.isActive,
              description: initialData.description ?? '',
          });
      }
  }, [initialData, form]);

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
                <Input placeholder="e.g., Paracetamol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="productCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                  <FormLabel>Selling Price (PHP)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10.50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief description of the product." {...field} />
              </FormControl>
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
                <FormLabel className="text-base">
                  Active
                </FormLabel>
                <FormDescription>
                  Uncheck this to archive the product instead of deleting it.
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
} 