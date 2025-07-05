"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const upsertInventoryItemSchema = z.object({
  productCategoryId: z.string().optional(),
  itemName: z.string().min(1, "Product name is required"),
  genericName: z.string().optional(),
  brandName: z.string().optional(),
  sku: z.string().optional(),
  dosageForm: z.string().optional(), // e.g., Tablet, Syrup
  strength: z.string().optional(), // e.g., 500mg
  quantityOnHand: z.coerce.number().min(0, "Quantity must be a positive number"),
  reorderLevel: z.coerce.number().min(0, "Reorder level must be a positive number"),
  purchasePrice: z.coerce.number().optional(),
  sellingPrice: z.coerce.number().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  location: z.string().optional(),
});

type UpsertInventoryItemFormValues = z.infer<typeof upsertInventoryItemSchema>;

interface UpsertInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UpsertInventoryItemFormValues) => void;
  item: InventoryItem | null;
  isLoading: boolean;
  productCategories: ProductCategory[];
}

export default function UpsertInventoryItemModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  isLoading,
  productCategories,
}: UpsertInventoryItemModalProps) {
  const form = useForm<UpsertInventoryItemFormValues>({
    resolver: zodResolver(upsertInventoryItemSchema),
  });

  useEffect(() => {
    form.reset({
      productCategoryId: item?.productCategoryId ?? '',
      itemName: item?.itemName ?? "",
      genericName: item?.genericName ?? "",
      brandName: item?.brandName ?? "",
      sku: item?.sku ?? "",
      dosageForm: item?.dosageForm ?? "",
      strength: item?.strength ?? "",
      quantityOnHand: item?.quantityOnHand ?? 0,
      reorderLevel: item?.reorderLevel ?? 10,
      purchasePrice: item?.purchasePrice ? Number(item.purchasePrice) : undefined,
      sellingPrice: item?.sellingPrice ? Number(item.sellingPrice) : undefined,
      batchNumber: item?.batchNumber ?? "",
      expiryDate: item?.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
      location: item?.location ?? "",
    });
  }, [item, form, isOpen]);

  const dialogTitle = item ? "Edit Inventory Item" : "Add New Inventory Item";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] p-4">
              <div className="space-y-4">
                <FormField control={form.control} name="productCategoryId" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <Select onValueChange={field.onChange} value={field.value ?? ''}> <FormControl> <SelectTrigger> <SelectValue placeholder="Select a category (optional)" /> </SelectTrigger> </FormControl> <SelectContent> {productCategories.map(cat => ( <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="itemName" render={({ field }) => ( <FormItem> <FormLabel>Product Name</FormLabel> <FormControl> <Input placeholder="e.g., Paracetamol 500mg" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="genericName" render={({ field }) => ( <FormItem> <FormLabel>Generic Name</FormLabel> <FormControl> <Input placeholder="e.g., Paracetamol" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="brandName" render={({ field }) => ( <FormItem> <FormLabel>Brand Name</FormLabel> <FormControl> <Input placeholder="e.g., Biogesic" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="sku" render={({ field }) => ( <FormItem> <FormLabel>SKU (Stock Keeping Unit)</FormLabel> <FormControl> <Input placeholder="e.g., PARA-500" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dosageForm" render={({ field }) => ( <FormItem> <FormLabel>Dosage Form</FormLabel> <FormControl> <Input placeholder="e.g., Tablet" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="strength" render={({ field }) => ( <FormItem> <FormLabel>Strength</FormLabel> <FormControl> <Input placeholder="e.g., 500mg" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="quantityOnHand" render={({ field }) => ( <FormItem> <FormLabel>Quantity</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 100" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                  <FormField control={form.control} name="reorderLevel" render={({ field }) => ( <FormItem> <FormLabel>Reorder Level</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 10" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="purchasePrice" render={({ field }) => ( <FormItem> <FormLabel>Purchase Price</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 1.50" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="sellingPrice" render={({ field }) => ( <FormItem> <FormLabel>Selling Price</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 2.00" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={form.control} name="batchNumber" render={({ field }) => ( <FormItem> <FormLabel>Batch Number</FormLabel> <FormControl> <Input placeholder="e.g., BATCH-001" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="expiryDate" render={({ field }) => ( <FormItem> <FormLabel>Expiry Date</FormLabel> <FormControl> <Input type="date" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl> <Input placeholder="e.g., Shelf A, Bin 4" {...field} value={field.value ?? ''} /> </FormControl> <FormMessage /> </FormItem> )}/>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 