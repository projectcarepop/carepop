'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';

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

    return (
        <>
            <AddEditOverrideModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(values) => upsertMutation.mutate(values)}
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
    onSubmit: (values: UpsertClinicOverridePayload) => void;
    initialData: ClinicOverride | null;
    isLoading: boolean;
}

const AddEditOverrideModal: React.FC<AddEditModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (initialData) {
            setStartDateTime(formatAsLocalDateTime(initialData.startDateTime));
            setEndDateTime(formatAsLocalDateTime(initialData.endDateTime));
            setReason(initialData.reason ?? '');
        } else {
            setStartDateTime('');
            setEndDateTime('');
            setReason('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            startDateTime: new Date(startDateTime).toISOString(),
            endDateTime: new Date(endDateTime).toISOString(),
            reason,
            isAvailable: false, // For now, all overrides make the clinic unavailable
        });
    };
    
    // Helper to format date for datetime-local input
    const formatAsLocalDateTime = (dateString: string) => {
        const date = new Date(dateString);
        // This format is required by the input type="datetime-local"
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().substring(0, 16);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Override' : 'Add New Override'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the details for this clinic-wide override.' : 'Create a new clinic-wide override.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDateTime">Start Date and Time</Label>
                        <Input id="startDateTime" type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDateTime">End Date and Time</Label>
                        <Input id="endDateTime" type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Input id="reason" placeholder="e.g., Company Holiday" value={reason} onChange={(e) => setReason(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Override'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 