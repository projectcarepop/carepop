"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InventoryItem, ProductCategory } from "./columns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

const upsertInventoryItemSchema = z.object({
  productCategoryId: z.string().optional(),
  itemName: z.string().min(1, "Product name is required"),
  genericName: z.string().optional(),
  brandName: z.string().optional(),
  sku: z.string().optional(),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  quantityOnHand: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().min(0),
  purchasePrice: z.coerce.number().optional(),
  sellingPrice: z.coerce.number().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof upsertInventoryItemSchema>;

interface UpsertInventoryFormProps {
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
}: UpsertInventoryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(upsertInventoryItemSchema),
    defaultValues: {
      itemName: initialData?.itemName || "",
      genericName: initialData?.genericName || "",
      brandName: initialData?.brandName || "",
      sku: initialData?.sku || "",
      dosageForm: initialData?.dosageForm || "",
      strength: initialData?.strength || "",
      quantityOnHand: initialData?.quantityOnHand || 0,
      reorderLevel: initialData?.reorderLevel || 10,
      purchasePrice: initialData?.purchasePrice ? Number(initialData.purchasePrice) : undefined,
      sellingPrice: initialData?.sellingPrice ? Number(initialData.sellingPrice) : undefined,
      batchNumber: initialData?.batchNumber || "",
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : "",
      location: initialData?.location || "",
      productCategoryId: initialData?.productCategoryId || "",
    },
  });

  useEffect(() => {
    form.reset(
      {
        itemName: initialData?.itemName || "",
        genericName: initialData?.genericName || "",
        brandName: initialData?.brandName || "",
        sku: initialData?.sku || "",
        dosageForm: initialData?.dosageForm || "",
        strength: initialData?.strength || "",
        quantityOnHand: initialData?.quantityOnHand || 0,
        reorderLevel: initialData?.reorderLevel || 10,
        purchasePrice: initialData?.purchasePrice ? Number(initialData.purchasePrice) : undefined,
        sellingPrice: initialData?.sellingPrice ? Number(initialData.sellingPrice) : undefined,
        batchNumber: initialData?.batchNumber || "",
        expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : "",
        location: initialData?.location || "",
        productCategoryId: initialData?.productCategoryId || "",
      }
    );
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] p-4">
          <div className="space-y-4">
            <FormField control={form.control} name="itemName" render={({ field }) => ( <FormItem> <FormLabel>Product Name *</FormLabel> <FormControl> <Input placeholder="e.g., Paracetamol 500mg" {...field} value={field.value ?? ''} disabled={isPending} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="productCategoryId" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a category" /> </SelectTrigger> </FormControl> <SelectContent> {productCategories.map(cat => ( <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="genericName" render={({ field }) => ( <FormItem> <FormLabel>Generic Name</FormLabel> <FormControl> <Input placeholder="e.g., Paracetamol" {...field} value={field.value ?? ''} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="brandName" render={({ field }) => ( <FormItem> <FormLabel>Brand Name</FormLabel> <FormControl> <Input placeholder="e.g., Biogesic" {...field} value={field.value ?? ''} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
            </div>
            <FormField control={form.control} name="sku" render={({ field }) => ( <FormItem> <FormLabel>SKU</FormLabel> <FormControl> <Input placeholder="e.g., PARA-500" {...field} value={field.value ?? ''} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="dosageForm" render={({ field }) => ( <FormItem> <FormLabel>Dosage Form</FormLabel> <FormControl> <Input placeholder="e.g., Tablet" {...field} value={field.value ?? ''} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="strength" render={({ field }) => ( <FormItem> <FormLabel>Strength</FormLabel> <FormControl> <Input placeholder="e.g., 500mg" {...field} value={field.value ?? ''} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="quantityOnHand" render={({ field }) => ( <FormItem> <FormLabel>Quantity on Hand</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 100" {...field} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="reorderLevel" render={({ field }) => ( <FormItem> <FormLabel>Reorder Level</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 10" {...field} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="purchasePrice" render={({ field }) => ( <FormItem> <FormLabel>Purchase Price</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 1.50" {...field} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="sellingPrice" render={({ field }) => ( <FormItem> <FormLabel>Selling Price</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 2.00" {...field} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
            </div>
            <FormField control={form.control} name="batchNumber" render={({ field }) => ( <FormItem> <FormLabel>Batch Number</FormLabel> <FormControl> <Input placeholder="e.g., BATCH-001" {...field} value={field.value ?? ''} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="expiryDate" render={({ field }) => ( <FormItem> <FormLabel>Expiry Date</FormLabel> <FormControl> <Input type="date" {...field} value={field.value ?? ''} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl> <Input placeholder="e.g., Shelf A, Bin 4" {...field} value={field.value ?? ''} disabled={isPending}/> </FormControl> <FormMessage /> </FormItem> )}/>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save changes' : 'Create Item'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
} 