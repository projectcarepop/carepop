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
import { InventoryItem } from "./columns"; // Assuming type is exported from columns

// TODO: This is a placeholder schema. We need to fetch product categories
// and populate a select dropdown. For now, we'll use a text input.
const upsertInventoryItemSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional(),
  quantityOnHand: z.coerce.number().min(0, "Quantity must be a positive number"),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(), // Using string for now, will be a date picker
});

type UpsertInventoryItemFormValues = z.infer<typeof upsertInventoryItemSchema>;

interface UpsertInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UpsertInventoryItemFormValues) => void;
  item: InventoryItem | null; // null for 'Add', object for 'Edit'
  isLoading: boolean;
}

export default function UpsertInventoryItemModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  isLoading,
}: UpsertInventoryItemModalProps) {
  const form = useForm<UpsertInventoryItemFormValues>({
    resolver: zodResolver(upsertInventoryItemSchema),
    defaultValues: {
      name: item?.name ?? "",
      sku: item?.sku ?? "",
      quantityOnHand: item?.quantityOnHand ?? 0,
      batchNumber: item?.batchNumber ?? "",
      expiryDate: item?.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
    },
  });

  // Reset form when item changes
  useEffect(() => {
    form.reset({
      name: item?.name ?? "",
      sku: item?.sku ?? "",
      quantityOnHand: item?.quantityOnHand ?? 0,
      batchNumber: item?.batchNumber ?? "",
      expiryDate: item?.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
    });
  }, [item, form]);

  const dialogTitle = item ? "Edit Inventory Item" : "Add New Inventory Item";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paracetamol 500mg" {...field} />
                  </FormControl>
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
                    <Input placeholder="e.g., PARA-500" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantityOnHand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batchNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BATCH-001" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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