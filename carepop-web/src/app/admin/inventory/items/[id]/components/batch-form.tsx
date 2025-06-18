'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { batchFormSchema, createInventoryItemBatch, updateInventoryItemBatch } from '@/lib/actions/inventory-item-batch.admin.actions';
import { useToast } from '@/hooks/use-toast';
import { ISupplier } from '../page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { IBatch } from '../page';

interface BatchFormProps {
    inventoryItemId: string;
    suppliers: ISupplier[];
    onSuccess: () => void;
    initialData?: IBatch;
}

type BatchFormValues = z.infer<typeof batchFormSchema>;

export function BatchForm({ inventoryItemId, suppliers, onSuccess, initialData }: BatchFormProps) {
    const { toast } = useToast();
    const isEditMode = !!initialData;

    const form = useForm<BatchFormValues>({
        resolver: zodResolver(batchFormSchema),
        defaultValues: {
            item_id: inventoryItemId,
            batch_number: initialData?.batch_number || '',
            quantity: initialData?.quantity || 0,
            expiration_date: initialData?.expiration_date ? format(new Date(initialData.expiration_date), 'yyyy-MM-dd') : '',
            cost_per_item: initialData?.cost_per_item || undefined,
            supplier_id: initialData?.supplier_id || undefined,
        },
    });

    const onSubmit = async (values: BatchFormValues) => {
        const result = isEditMode
            ? await updateInventoryItemBatch(initialData!.id, values)
            : await createInventoryItemBatch(values);

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            onSuccess();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="batch_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Batch Number</FormLabel>
                            <FormControl><Input placeholder="e.g., BN12345" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Quantity</FormLabel>
                                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cost_per_item"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Cost Per Item</FormLabel>
                                <FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="expiration_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Expiration Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={'outline'}
                                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                        >
                                            {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a supplier" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {suppliers.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Batch')}
                </Button>
            </form>
        </Form>
    );
} 