'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    getDoctorSchedules, 
    createDoctorSchedule,
    updateDoctorSchedule,
    deleteDoctorSchedule, 
    UpsertDoctorSchedulePayload,
    DoctorSchedule,
} from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const scheduleFormSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (HH:mm or HH:mm:ss)"),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (HH:mm or HH:mm:ss)"),
}).refine(data => {
    // Basic time comparison
    return data.endTime > data.startTime;
}, {
    message: "End time must be after start time",
    path: ['endTime']
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface AddEditScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: ScheduleFormValues) => void;
    initialData: DoctorSchedule | null;
    isLoading: boolean;
}

const AddEditScheduleModal: React.FC<AddEditScheduleModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            dayOfWeek: 1,
            startTime: '09:00:00',
            endTime: '17:00:00',
        }
    });

    useEffect(() => {
        if(isOpen) {
            if (initialData) {
                form.reset({
                    dayOfWeek: initialData.dayOfWeek,
                    startTime: initialData.startTime,
                    endTime: initialData.endTime,
                });
            } else {
                form.reset({
                    dayOfWeek: 1, // Monday
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                });
            }
        }
    }, [initialData, isOpen, form]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="dayOfWeek"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Day of Week</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {WEEK_DAYS.map((day, i) => <SelectItem key={day} value={String(i)}>{day}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" step="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" step="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};


interface DoctorScheduleManagerProps {
  doctorId: string;
}

export const DoctorScheduleManager: React.FC<DoctorScheduleManagerProps> = ({ doctorId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);

  const { session } = useAuth();
  const accessToken = session?.access_token;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: schedules, isLoading: isLoadingSchedules } = useQuery({
      queryKey: ['doctorSchedules', doctorId],
      queryFn: () => {
          if (!accessToken || !doctorId) return [];
          return getDoctorSchedules(doctorId, accessToken);
      },
      enabled: !!accessToken && !!doctorId,
  });

  const upsertMutation = useMutation({
      mutationFn: (scheduleData: UpsertDoctorSchedulePayload & { scheduleId?: string }) => {
          if (!accessToken || !doctorId) throw new Error("Not authorized");
          
          if (scheduleData.scheduleId) {
              const { scheduleId, ...payload } = scheduleData;
              return updateDoctorSchedule(scheduleId, payload, accessToken);
          } else {
              return createDoctorSchedule(doctorId, scheduleData, accessToken);
          }
      },
      onSuccess: (data, variables) => {
          toast({ title: "Success", description: `Schedule ${variables.scheduleId ? 'updated' : 'created'} successfully.` });
          queryClient.invalidateQueries({ queryKey: ['doctorSchedules', doctorId] });
          setIsModalOpen(false);
      },
      onError: (error: Error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
      }
  });

  const deleteMutation = useMutation({
      mutationFn: (scheduleId: string) => {
          if (!accessToken) throw new Error("Not authorized");
          return deleteDoctorSchedule(scheduleId, accessToken);
      },
      onSuccess: () => {
          toast({ title: "Success", description: "Schedule deleted successfully." });
          queryClient.invalidateQueries({ queryKey: ['doctorSchedules', doctorId] });
      },
      onError: (error: Error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
      }
  });

  const handleAddClick = () => {
      setSelectedSchedule(null);
      setIsModalOpen(true);
  }
  const handleEditClick = (schedule: DoctorSchedule) => {
      setSelectedSchedule(schedule);
      setIsModalOpen(true);
  }
  
  const handleDeleteConfirmation = (scheduleId: string) => {
      // It's better to use a confirmation dialog here
      if (window.confirm("Are you sure you want to delete this schedule?")) {
        deleteMutation.mutate(scheduleId);
      }
  }

  const handleFormSubmit = (values: ScheduleFormValues) => {
    const payload: UpsertDoctorSchedulePayload & { scheduleId?: string } = {
        ...values,
        startTime: `${values.startTime}`, // Ensure format is correct
        endTime: `${values.endTime}`,
    };
    if (selectedSchedule?.id) {
        payload.scheduleId = selectedSchedule.id;
    }
    upsertMutation.mutate(payload);
  };

  return (
    <>
    <AddEditScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedSchedule}
        isLoading={upsertMutation.isPending}
    />
    <Card>
      <CardHeader>
        <CardTitle>Doctor Schedules</CardTitle>
        <CardDescription>
          Manage recurring weekly schedules for this doctor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Recurring Weekly Schedule</h3>
                <Button onClick={handleAddClick} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Schedule
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Day of Week</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingSchedules ? (
                            <TableRow><TableCell colSpan={4}><Skeleton className="h-5 w-full my-2" /></TableCell></TableRow>
                        ) : schedules && schedules.length > 0 ? (
                            schedules.map(schedule => (
                                <TableRow key={schedule.id}>
                                    <TableCell>{WEEK_DAYS[schedule.dayOfWeek]}</TableCell>
                                    <TableCell>{schedule.startTime}</TableCell>
                                    <TableCell>{schedule.endTime}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleEditClick(schedule)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteConfirmation(schedule.id)} className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">No recurring schedules found for this doctor.</TableCell>
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