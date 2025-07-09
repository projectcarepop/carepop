'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { fromZonedTime } from 'date-fns-tz';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const overrideFormSchema = z.object({
  startDate: z.string().min(1, 'Start date is required.'),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
  endDate: z.string().min(1, 'End date is required.'),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format"),
  isAvailable: z.boolean(),
}).refine(data => {
    const start = new Date(`${data.startDate}T${data.startTime}`);
    const end = new Date(`${data.endDate}T${data.endTime}`);
    return end > start;
}, {
    message: 'End date and time must be after start date and time.',
    path: ['endDate'],
});

type OverrideFormValues = z.infer<typeof overrideFormSchema>;

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
        if(window.confirm('Are you sure?')) deleteMutation.mutate(overrideId);
    };
    
    const handleFormSubmit = (values: OverrideFormValues) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const startDateTime = fromZonedTime(`${values.startDate}T${values.startTime}`, timeZone);
        const endDateTime = fromZonedTime(`${values.endDate}T${values.endTime}`, timeZone);
        
        upsertMutation.mutate({
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            isAvailable: values.isAvailable,
        });
    }

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
            <CardTitle>Doctor Availability Overrides</CardTitle>
            <CardDescription>
              Define specific dates or times when a doctor is available or unavailable, overriding their recurring weekly schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
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
                        ) : overrides?.data?.length > 0 ? (
                            (overrides.data || []).map((override: DoctorOverride) => (
                                <TableRow key={override.id}>
                                    <TableCell>{format(new Date(override.startDateTime), "PPP p")}</TableCell>
                                    <TableCell>{format(new Date(override.endDateTime), "PPP p")}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${override.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            <div className={`mr-2 h-2 w-2 rounded-full ${override.isAvailable ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                            {override.isAvailable ? 'Available' : 'Unavailable'}
                                        </div>
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
          </CardContent>
        </Card>
    </>
  );
};


// Add/Edit Modal
interface AddEditOverrideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: OverrideFormValues) => void;
    initialData: DoctorOverride | null;
    isLoading: boolean;
}

const AddEditOverrideModal: React.FC<AddEditOverrideModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const form = useForm<OverrideFormValues>({
        resolver: zodResolver(overrideFormSchema),
        defaultValues: {
            isAvailable: false,
        }
    });

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const defaultStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
            const defaultEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);

            const start = initialData ? new Date(initialData.startDateTime) : defaultStartTime;
            const end = initialData ? new Date(initialData.endDateTime) : defaultEndTime;

            form.reset({
                startDate: format(start, 'yyyy-MM-dd'),
                startTime: format(start, 'HH:mm:ss'),
                endDate: format(end, 'yyyy-MM-dd'),
                endTime: format(end, 'HH:mm:ss'),
                isAvailable: initialData?.isAvailable ?? false,
            });
        }
    }, [initialData, isOpen, form]);
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Override' : 'Add New Override'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="startTime" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Time</FormLabel>
                                    <FormControl><Input type="time" step="1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="endTime" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Time</FormLabel>
                                    <FormControl><Input type="time" step="1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField
                            control={form.control}
                            name="isAvailable"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                   <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                   </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Mark as available during this time
                                        </FormLabel>
                                    </div>
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