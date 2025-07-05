"use client";
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getItemBatches, addBatchToItem, deleteItemBatch } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { Trash2, Loader2 } from 'lucide-react';
import { InventoryItem, InventoryItemBatch } from '@/lib/types/inventory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const batchFormSchema = z.object({
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  batchNumber: z.string().optional(),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

type BatchFormValues = z.infer<typeof batchFormSchema>;

interface ManageItemBatchesModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageItemBatchesModal({ item, isOpen, onClose }: ManageItemBatchesModalProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['itemBatches', item?.id],
    queryFn: () => getItemBatches(item!.id, session!.access_token!).then(res => res.data),
    enabled: !!item && !!session?.access_token && isOpen,
  });

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: { quantity: 1, batchNumber: '', expiryDate: '' },
  });

  const addMutation = useMutation({
    mutationFn: (values: BatchFormValues) => addBatchToItem(item!.id, values, session!.access_token!),
    onSuccess: () => {
      toast({ title: "Success", description: "Batch added." });
      queryClient.invalidateQueries({ queryKey: ['itemBatches', item?.id] });
      form.reset();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (batchId: string) => deleteItemBatch(batchId, session!.access_token!),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Batch deleted.' });
      queryClient.invalidateQueries({ queryKey: ['itemBatches', item?.id] });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const onSubmit = (values: BatchFormValues) => {
    addMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Batches for: {item?.itemName}</DialogTitle>
          <DialogDescription>
            Add new stock or remove existing batches for this item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div>
                <h3 className="text-lg font-medium mb-4">Add New Batch</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="quantity" render={({ field }) => ( <FormItem> <FormLabel>Quantity</FormLabel> <FormControl> <Input type="number" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="batchNumber" render={({ field }) => ( <FormItem> <FormLabel>Batch Number</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="expiryDate" render={({ field }) => ( <FormItem> <FormLabel>Expiry Date</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={addMutation.isPending}>
                                {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Batch
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
            <div>
                <h3 className="text-lg font-medium mb-4">Existing Batches</h3>
                 <div className="rounded-md border h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Batch #</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.map((batch: InventoryItemBatch) => (
                                <TableRow key={batch.id}>
                                <TableCell>{batch.quantity}</TableCell>
                                <TableCell>{batch.batchNumber || 'N/A'}</TableCell>
                                <TableCell>{new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(batch.id)} disabled={deleteMutation.isPending}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                 </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
