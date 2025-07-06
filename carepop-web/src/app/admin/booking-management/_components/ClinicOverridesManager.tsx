'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/contexts/auth-context';
import { getClinicOverrides, upsertClinicOverride, deleteClinicOverride, ClinicOverride, UpsertClinicOverridePayload } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
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

  const { data: overrides, isLoading, error } = useQuery<ClinicOverride[]>({
      queryKey: ['clinicOverrides', clinicId],
      queryFn: () => {
          if (!accessToken) throw new Error("Not authorized");
          return getClinicOverrides(clinicId, accessToken);
      },
      enabled: !!accessToken && !!clinicId,
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
      deleteMutation.mutate(overrideId);
  }

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
        <CardDescription>
          Manage clinic-wide holidays, closures, or special events. These rules override all doctor schedules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Override
          </Button>
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reason</TableHead>
                        <TableHead>Start Date & Time</TableHead>
                        <TableHead>End Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <Skeleton className="h-5 w-full my-2" />
                                <Skeleton className="h-5 w-full my-2" />
                                <Skeleton className="h-5 w-full my-2" />
                            </TableCell>
                        </TableRow>
                    ) : error ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-destructive">
                                Failed to load overrides: {error.message}
                            </TableCell>
                        </TableRow>
                    ) : overrides && overrides.length > 0 ? (
                        overrides.map((override) => (
                            <TableRow key={override.id}>
                                <TableCell className="font-medium">{override.reason || 'N/A'}</TableCell>
                                <TableCell>{new Date(override.startDateTime).toLocaleString()}</TableCell>
                                <TableCell>{new Date(override.endDateTime).toLocaleString()}</TableCell>
                                <TableCell>{override.isAvailable ? 'Available' : 'Unavailable'}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditClick(override)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteClick(override.id)} className="text-destructive">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No overrides found for this clinic.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
    </>
  );
};


// Simplified Add/Edit Modal Component
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
            setStartDateTime(new Date(initialData.startDateTime).toISOString().substring(0, 16));
            setEndDateTime(new Date(initialData.endDateTime).toISOString().substring(0, 16));
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Override' : 'Add New Override'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the details for this clinic-wide override.' : 'Create a new clinic-wide override for holidays or special events.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDateTime">Start Date and Time</Label>
                        <Input id="startDateTime" type="datetime-local" value={startDateTime} onChange={(e) => setStartDateTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDateTime">End Date and Time</Label>
                        <Input id="endDateTime" type="datetime-local" value={endDateTime} onChange={(e) => setEndDateTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Input id="reason" placeholder="e.g., Christmas Day Closure" value={reason} onChange={(e) => setReason(e.target.value)} />
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