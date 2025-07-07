'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getDoctorOverrides, upsertDoctorOverride, deleteDoctorOverride, DoctorOverride, UpsertDoctorOverridePayload } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

interface DoctorOverridesManagerProps {
  doctorId: string;
}

export const DoctorOverridesManager: React.FC<DoctorOverridesManagerProps> = ({ doctorId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOverride, setSelectedOverride] = useState<DoctorOverride | null>(null);

    const { session } = useAuth();
    const accessToken = session?.access_token;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: overrides, isLoading: isLoadingOverrides, error: overridesError } = useQuery({
        queryKey: ['doctorOverrides', doctorId],
        queryFn: () => {
            if (!accessToken || !doctorId) throw new Error("No doctor selected");
            return getDoctorOverrides(doctorId, accessToken);
        },
        enabled: !!accessToken && !!doctorId,
    });
    
    const upsertMutation = useMutation({
        mutationFn: (overrideData: UpsertDoctorOverridePayload) => {
            if (!accessToken || !doctorId) throw new Error("Not authorized");
            return upsertDoctorOverride(doctorId, overrideData, accessToken, selectedOverride?.id);
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Override saved successfully." });
            queryClient.invalidateQueries({ queryKey: ['doctorOverrides', doctorId] });
            setIsModalOpen(false);
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (overrideId: string) => {
            if (!accessToken) throw new Error("Not authorized");
            return deleteDoctorOverride(overrideId, accessToken);
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Override deleted successfully." });
            queryClient.invalidateQueries({ queryKey: ['doctorOverrides', doctorId] });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleAddClick = () => {
        setSelectedOverride(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (override: DoctorOverride) => {
        setSelectedOverride(override);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (overrideId: string) => {
        deleteMutation.mutate(overrideId);
    };

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
            <CardTitle>Doctor Availability Overrides</CardTitle>
            <CardDescription>
              Define specific dates or times when a doctor is available or unavailable, overriding their recurring weekly schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">One-off Schedule Overrides</h3>
                    <Button size="sm" onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Override
                    </Button>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Start Time</TableHead>
                                <TableHead>End Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingOverrides ? (
                                <TableRow><TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                            ) : overridesError ? (
                                <TableRow><TableCell colSpan={4} className="text-destructive text-center">{overridesError.message}</TableCell></TableRow>
                            ) : overrides && overrides.data.length > 0 ? (
                                overrides.data.map((override: DoctorOverride) => (
                                    <TableRow key={override.id}>
                                        <TableCell>{format(new Date(override.startTime), "PPP p")}</TableCell>
                                        <TableCell>{format(new Date(override.endTime), "PPP p")}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${override.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {override.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleEditClick(override)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(override.id)} className="text-destructive">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">No overrides found for this doctor.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
          </CardContent>
        </Card>
    </>
  );
};


// Add/Edit Modal
interface AddEditOverrideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: UpsertDoctorOverridePayload) => void;
    initialData: DoctorOverride | null;
    isLoading: boolean;
}

const AddEditOverrideModal: React.FC<AddEditOverrideModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isAvailable, setIsAvailable] = useState(false);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const defaultStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0); // 9 AM today
            const defaultEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0); // 5 PM today

            const start = initialData ? toZonedTime(new Date(initialData.startTime), timeZone) : defaultStartTime;
            const end = initialData ? toZonedTime(new Date(initialData.endTime), timeZone) : defaultEndTime;

            setStartDate(format(start, 'yyyy-MM-dd'));
            setStartTime(format(start, 'HH:mm:ss'));
            setEndDate(format(end, 'yyyy-MM-dd'));
            setEndTime(format(end, 'HH:mm:ss'));
            setIsAvailable(initialData?.isAvailable ?? false);
        }
    }, [initialData, isOpen, timeZone]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const startDateTime = fromZonedTime(`${startDate}T${startTime}`, timeZone);
        const endDateTime = fromZonedTime(`${endDate}T${endTime}`, timeZone);

        onSubmit({ 
            startTime: startDateTime.toISOString(), 
            endTime: endDateTime.toISOString(), 
            isAvailable 
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Override' : 'Add New Override'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input id="startTime" type="time" step="1" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input id="endTime" type="time" step="1" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="isAvailable" checked={isAvailable} onCheckedChange={(checked) => setIsAvailable(!!checked)} />
                        <label
                            htmlFor="isAvailable"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Mark as available during this time
                        </label>
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