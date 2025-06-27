'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Loader2 } from 'lucide-react';
import { AdminProduct } from '@/lib/types';

const formSchema = z.object({
  quantity: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
});

interface UpdateStockFormProps {
  product?: AdminProduct;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isPending: boolean;
}

export function UpdateStockForm({ product, onSubmit, isPending }: UpdateStockFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: product?.quantityOnHand || 0,
    },
  });

  React.useEffect(() => {
    if (product) {
      form.reset({ quantity: product.quantityOnHand || 0 });
    }
  }, [product, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Stock Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
} 