"use client";
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { ProductCategory } from '@/services/api'; 
import { InventoryItem } from './columns';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  productCategoryId: z.string().uuid('Invalid category'),
  
  genericName: z.string().optional(),
  brandName: z.string().optional(),
  sku: z.string().optional(),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  
  quantityInStock: z.coerce.number().min(0, 'Quantity must be non-negative'),
  reorderLevel: z.coerce.number().min(0, 'Reorder level must be non-negative'),

  purchasePrice: z.coerce.number().min(0, 'Price must be non-negative').optional(),
  sellingPrice: z.coerce.number().min(0, 'Price must be non-negative').optional(),

  location: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UpsertInventoryItemFormProps {
  initialData?: InventoryItem;
  onSubmit: (values: FormValues) => void;
  isPending: boolean;
  productCategories: ProductCategory[];
  onClose: () => void;
}

export function UpsertInventoryItemForm({
  initialData,
  onSubmit,
  isPending,
  productCategories,
  onClose,
}: UpsertInventoryItemFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: initialData?.itemName ?? '',
      productCategoryId: initialData?.productCategoryId ?? '',
      genericName: initialData?.genericName ?? '',
      brandName: initialData?.brandName ?? '',
      sku: initialData?.sku ?? '',
      dosageForm: initialData?.dosageForm ?? '',
      strength: initialData?.strength ?? '',
      quantityInStock: initialData?.quantityInStock ?? 0,
      reorderLevel: initialData?.reorderLevel ?? 10,
      purchasePrice: initialData?.purchasePrice ?? undefined,
      sellingPrice: initialData?.sellingPrice ?? undefined,
      location: initialData?.location ?? '',
      description: initialData?.description ?? '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-4">
                <FormField control={form.control} name="itemName" render={({ field }) => ( <FormItem> <FormLabel>Item Name</FormLabel> <FormControl> <Input placeholder="e.g., Paracetamol 500mg" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                
                <FormField control={form.control} name="productCategoryId" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a category" /> </SelectTrigger> </FormControl> <SelectContent> {productCategories.map((category) => ( <SelectItem key={category.id} value={category.id}> {category.name} </SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="genericName" render={({ field }) => ( <FormItem> <FormLabel>Generic Name</FormLabel> <FormControl> <Input placeholder="e.g., Paracetamol" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="brandName" render={({ field }) => ( <FormItem> <FormLabel>Brand Name</FormLabel> <FormControl> <Input placeholder="e.g., Biogesic" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>

                <FormField control={form.control} name="sku" render={({ field }) => ( <FormItem> <FormLabel>SKU</FormLabel> <FormControl> <Input placeholder="e.g., SKU-12345" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="dosageForm" render={({ field }) => ( <FormItem> <FormLabel>Dosage Form</FormLabel> <FormControl> <Input placeholder="e.g., Tablet" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="strength" render={({ field }) => ( <FormItem> <FormLabel>Strength</FormLabel> <FormControl> <Input placeholder="e.g., 500mg" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="quantityInStock" render={({ field }) => ( <FormItem> <FormLabel>Quantity in Stock</FormLabel> <FormControl> <Input type="number" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="reorderLevel" render={({ field }) => ( <FormItem> <FormLabel>Reorder Level</FormLabel> <FormControl> <Input type="number" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="purchasePrice" render={({ field }) => ( <FormItem> <FormLabel>Purchase Price</FormLabel> <FormControl> <Input type="number" step="0.01" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="sellingPrice" render={({ field }) => ( <FormItem> <FormLabel>Selling Price</FormLabel> <FormControl> <Input type="number" step="0.01" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>

                <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl> <Input placeholder="e.g., Shelf A, Bin 1" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>

                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Input placeholder="A short description of the item" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
} 