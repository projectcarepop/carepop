'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle } from 'lucide-react';

import { getClinicOverrides, upsertClinicOverride, deleteClinicOverride, type ClinicOverride, type UpsertClinicOverridePayload } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns-overrides'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


// Zod schema for the form
const overrideFormSchema = z.object({
  startDateTime: z.string().min(1, 'Start date and time are required.'),
  endDateTime: z.string().min(1, 'End date and time are required.'),
  reason: z.string().optional(),
}).refine(data => new Date(data.endDateTime) > new Date(data.startDateTime), {
    message: "End date must be after start date.",
    path: ["endDateTime"],
});

type OverrideFormValues = z.infer<typeof overrideFormSchema>;

interface ClinicOverridesManagerProps {
    clinicId: string;
}

export const ClinicOverridesManager: React.FC<ClinicOverridesManagerProps> = ({ clinicId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOverride, setSelectedOverride] = useState<ClinicOverride | null>(null);
    
    const { session } = useAuth();
    const accessToken = session?.access_token;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: overrides, isLoading, isError, error } = useQuery({
        queryKey: ['clinicOverrides', clinicId],
        queryFn: () => {
            if (!accessToken) throw new Error("Not authorized");
            return getClinicOverrides(clinicId, accessToken);
        },
        enabled: !!clinicId && !!accessToken,
    });

    const upsertMutation = useMutation({
        mutationFn: (overrideData: UpsertClinicOverridePayload) => {
            if (!accessToken) throw new Error("Not authorized");
            return upsertClinicOverride(clinicId, overrideData, accessToken, selectedOverride?.id);
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Override saved successfully." });
            queryClient.invalidateQueries({ queryKey: ['clinicOverrides', clinicId] });
            setIsModalOpen(false);
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (overrideId: string) => {
            if (!accessToken) throw new Error("Not authorized");
            return deleteClinicOverride(overrideId, accessToken);
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Override deleted successfully." });
            queryClient.invalidateQueries({ queryKey: ['clinicOverrides', clinicId] });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleAddClick = () => {
        setSelectedOverride(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (override: ClinicOverride) => {
        setSelectedOverride(override);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (overrideId: string) => {
        // A confirmation dialog would be better, but for now window.confirm is used.
        if (window.confirm('Are you sure you want to delete this override?')) {
            deleteMutation.mutate(overrideId);
        }
    }

    if (isLoading) return <Skeleton className="h-48 w-full" />;
    if (isError) return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error instanceof Error ? error.message : "An unknown error occurred."}</AlertDescription>
        </Alert>
    );

    const handleFormSubmit = (values: OverrideFormValues) => {
        upsertMutation.mutate({
            ...values,
            startDateTime: new Date(values.startDateTime).toISOString(),
            endDateTime: new Date(values.endDateTime).toISOString(),
            isAvailable: false, // All clinic-wide overrides make it unavailable
        });
    };

    return (
        <>
            <AddEditOverrideModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedOverride}
                isLoading={upsertMutation.isPending}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Clinic-Wide Overrides</CardTitle>
                    <CardDescription>Manage clinic-wide holidays, closures, or special events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleAddClick}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Override
                        </Button>
                    </div>
                    <DataTable 
                        columns={columns({ onEdit: handleEditClick, onDelete: handleDeleteClick })} 
                        data={overrides || []} 
                    />
                </CardContent>
            </Card>
        </>
    );
};


interface AddEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: OverrideFormValues) => void;
    initialData: ClinicOverride | null;
    isLoading: boolean;
}

const AddEditOverrideModal: React.FC<AddEditModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const form = useForm<OverrideFormValues>({
        resolver: zodResolver(overrideFormSchema),
        defaultValues: {
            startDateTime: '',
            endDateTime: '',
            reason: '',
        }
    });
    
    // Helper to format date for datetime-local input
    const formatAsLocalDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().substring(0, 16);
    };

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    startDateTime: formatAsLocalDateTime(initialData.startDateTime),
                    endDateTime: formatAsLocalDateTime(initialData.endDateTime),
                    reason: initialData.reason ?? '',
                });
            } else {
                form.reset({
                    startDateTime: '',
                    endDateTime: '',
                    reason: '',
                });
            }
        }
    }, [initialData, isOpen, form]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Override' : 'Add New Override'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the details for this clinic-wide override.' : 'Create a new clinic-wide override.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="startDateTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date and Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDateTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date and Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Company Holiday" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Override'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 