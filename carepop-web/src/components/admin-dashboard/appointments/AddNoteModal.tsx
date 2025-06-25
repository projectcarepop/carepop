'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addNoteToAppointment } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle } from 'lucide-react';

const formSchema = z.object({
  note: z.string().min(10, { message: 'Note must be at least 10 characters.' }),
});

type AddNoteFormValues = z.infer<typeof formSchema>;

interface AddNoteModalProps {
  appointmentId: string;
}

export function AddNoteModal({ appointmentId }: AddNoteModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<AddNoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { note: '' },
  });

  const addNoteMutation = useMutation({
    mutationFn: (values: AddNoteFormValues) => addNoteToAppointment(appointmentId, values.note),
    onSuccess: () => {
        toast({ title: 'Note added successfully' });
        setIsOpen(false);
        form.reset();
        // Invalidate queries related to appointments or notes to refetch data
        queryClient.invalidateQueries({ queryKey: ['adminAppointmentDetails', appointmentId] });
        queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
        router.refresh(); 
    },
    onError: (err: Error) => toast({ title: "Failed to add note", description: err.message, variant: 'destructive' })
  });
  
  const isSubmitting = addNoteMutation.isPending;

  const onSubmit = (values: AddNoteFormValues) => {
      addNoteMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Note
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a New Note</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Doctor&apos;s Note</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Enter clinical notes for this visit..." {...field} rows={5} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Note
                    </Button>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
} 