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
import { type InventoryItem, type ProductCategory } from '@/lib/types/inventory';
import { Loader2 } from 'lucide-react';

// This schema defines the form's structure.
const formSchema = z.object({
  itemName: z.string().min(2, "Item name must be at least 2 characters."),
  productCategoryId: z.string({ required_error: "Please select a category." }).nullable(),
  sellingPrice: z.string().optional().nullable(),
  purchasePrice: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  genericName: z.string().optional().nullable(),
  brandName: z.string().optional().nullable(),
  dosageForm: z.string().optional().nullable(),
  strength: z.string().optional().nullable(),
  reorderLevel: z.coerce.number().int().min(0).default(10),
  location: z.string().optional().nullable(),
});

export type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: InventoryItem;
  onSubmit: (values: ProductFormValues) => void;
  isPending: boolean;
  categories: ProductCategory[];
}

export function ProductForm({ initialData, onSubmit, isPending, categories }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: '',
      productCategoryId: '',
      sellingPrice: '',
      purchasePrice: '',
      sku: '',
      genericName: '',
      brandName: '',
      dosageForm: '',
      strength: '',
      reorderLevel: 10,
      location: '',
    },
  });
  
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        itemName: initialData.itemName,
        productCategoryId: initialData.productCategoryId ?? null,
        sellingPrice: initialData.sellingPrice?.toString() ?? '',
        purchasePrice: initialData.purchasePrice?.toString() ?? '',
        sku: initialData.sku ?? '',
        genericName: initialData.genericName ?? '',
        brandName: initialData.brandName ?? '',
        dosageForm: initialData.dosageForm ?? '',
        strength: initialData.strength ?? '',
        reorderLevel: initialData.reorderLevel ?? 10,
        location: initialData.location ?? '',
      });
    }
  }, [initialData, form.reset]);

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
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
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
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PARA-500-100" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Biogesic" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genericName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Generic Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paracetamol" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>.
              )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="strength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strength</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 500mg" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosageForm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage Form</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tablet" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price (PHP)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 8.00" {...field} value={field.value ?? ''}/>
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
                  <FormLabel>Selling Price (PHP)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 10.50" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Re-order Level</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                   <FormDescription>
                    Min. stock level before re-ordering.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Shelf A-1" {...field} value={field.value ?? ''}/>
                  </FormControl>
                   <FormDescription>
                    Where the item is stored in the clinic.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Create Product'}
        </Button>
      </form>
    </Form>
  );
}