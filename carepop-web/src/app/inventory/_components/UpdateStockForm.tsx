'use client';

import React from 'react';
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
import { type InventoryItem } from '@/lib/types/inventory';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  quantityOnHand: z.coerce.number().int().min(0, "Quantity must be a positive number."),
});

export type UpdateStockFormValues = z.infer<typeof formSchema>;

interface UpdateStockFormProps {
  initialData: Pick<InventoryItem, 'quantityOnHand'>;
  onSubmit: (values: UpdateStockFormValues) => void;
  isPending: boolean;
}

export function UpdateStockForm({ initialData, onSubmit, isPending }: UpdateStockFormProps) {
  const form = useForm<UpdateStockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantityOnHand: initialData.quantityOnHand,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="quantityOnHand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Quantity on Hand</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50" {...field} />
              </FormControl>
              <FormDescription>
                Enter the new total quantity for this item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Stock'}
        </Button>
      </form>
    </Form>
  );
} 