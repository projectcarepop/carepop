'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  quantity: z.coerce.number().int({ message: 'Quantity must be a whole number.' }),
});

type UpdateStockFormValues = z.infer<typeof formSchema>;

interface UpdateStockFormProps {
  initialQuantity: number;
  onSubmit: (values: UpdateStockFormValues) => void;
  isSubmitting: boolean;
}

export function UpdateStockForm({ initialQuantity, onSubmit, isSubmitting }: UpdateStockFormProps) {
  const form = useForm<UpdateStockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: initialQuantity,
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
              <FormLabel>New Stock Quantity</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Stock
        </Button>
      </form>
    </Form>
  );
} 