'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { addMedicalRecord, getAppointmentDetails } from '@/services/api'; // addMedicalRecord needs to be created
import { type MedicalRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface MedicalRecordListProps {
    initialRecords: MedicalRecord[];
    appointmentId: string;
}

const noteFormSchema = z.object({
    note: z.string().min(10, "Note must be at least 10 characters long."),
});

type NoteFormData = z.infer<typeof noteFormSchema>;

const MedicalRecordCard = ({ record }: { record: MedicalRecord }) => {
    const noteDetails = typeof record.details === 'object' && record.details !== null && 'note' in record.details ? String(record.details.note) : JSON.stringify(record.details);
    const recordDate = new Date(record.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <div className="p-4 border rounded-md bg-slate-50">
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold capitalize">{record.recordType.replace('_', ' ').toLowerCase()}</p>
                <p className="text-xs text-gray-500">{recordDate}</p>
            </div>
            <p className="text-sm">{noteDetails}</p>
        </div>
    );
};


export function MedicalRecordList({ initialRecords, appointmentId }: MedicalRecordListProps) {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);

    const form = useForm<NoteFormData>({
        resolver: zodResolver(noteFormSchema),
        defaultValues: { note: '' },
    });

    const { data: records } = useQuery({
        queryKey: ['appointmentDetails', appointmentId, 'records'],
        queryFn: async () => {
            const details = await getAppointmentDetails(appointmentId, session!.access_token);
            return details.medicalRecords || [];
        },
        initialData: initialRecords,
        enabled: !!session,
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: NoteFormData) => {
            const payload = {
                recordType: 'DOCTOR_NOTE' as const,
                details: { note: data.note },
            };
            return addMedicalRecord(appointmentId, payload, session!.access_token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointmentDetails', appointmentId] });
            form.reset();
            setIsAddNoteOpen(false);
        },
        onError: (error) => {
            alert(`Failed to add note: ${error.message}`);
        },
    });

    function onSubmit(data: NoteFormData) {
        mutate(data);
    }
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Medical Records</h2>
                <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Doctor&apos;s Note</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Doctor&apos;s Note</DialogTitle>
                            <DialogDescription>
                                This note will be permanently added to the patient&apos;s medical record for this appointment.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="note"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Note Details</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter clinical notes, observations, etc." {...field} rows={6}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? 'Saving...' : 'Save Note'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="space-y-4">
                {records && records.length > 0 ? (
                    records.map(record => <MedicalRecordCard key={record.id} record={record} />)
                ) : (
                    <p className="text-gray-500 italic">No medical records found for this appointment.</p>
                )}
            </div>
        </div>
    );
} 