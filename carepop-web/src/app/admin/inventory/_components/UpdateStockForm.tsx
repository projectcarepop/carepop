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
import { Loader2 } from 'lucide-react';

// Updated schema to include batch details
const formSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  batchNumber: z.string().optional(),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
});

interface UpdateStockFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isPending: boolean;
}

export function UpdateStockForm({ onSubmit, isPending }: UpdateStockFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1, // Default to adding 1 unit
      batchNumber: '',
      expiryDate: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity to Add</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50" {...field} />
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
              <FormLabel>Batch Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., B12345" {...field} />
              </FormControl>
               <FormDescription>
                Leave blank if not applicable.
              </FormDescription>
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
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Adding Stock...' : 'Add Stock'}
        </Button>
      </form>
    </Form>
  );
} 