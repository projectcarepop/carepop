'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    getDoctorsByClinic, 
    getDoctorSchedules, 
    createDoctorSchedule,
    updateDoctorSchedule,
    deleteDoctorSchedule, 
    UpsertDoctorSchedulePayload 
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

// CORRECTED: The Doctor type should match the flat structure from the API
type Doctor = {
    id: string;
    fullName: string;
    specialtyText?: string | null;
    avatarUrl?: string | null;
}

type DoctorSchedule = {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DoctorScheduleManagerProps {
  clinicId: string;
}

export const DoctorScheduleManager: React.FC<DoctorScheduleManagerProps> = ({ clinicId }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);

  const { session } = useAuth();
  const accessToken = session?.access_token;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: doctors, isLoading: isLoadingDoctors, error: doctorsError } = useQuery<Doctor[]>({
      queryKey: ['doctorsByClinic', clinicId],
      queryFn: () => {
          if (!accessToken) throw new Error("Not authorized");
          return getDoctorsByClinic(clinicId, accessToken);
      },
      enabled: !!accessToken && !!clinicId,
  });

  const { data: schedules, isLoading: isLoadingSchedules, error: schedulesError } = useQuery<DoctorSchedule[]>({
      queryKey: ['doctorSchedules', selectedDoctorId],
      queryFn: () => {
          if (!accessToken || !selectedDoctorId) throw new Error("Not authorized or no doctor selected");
          return getDoctorSchedules(selectedDoctorId, accessToken);
      },
      enabled: !!accessToken && !!selectedDoctorId,
  });

  const upsertMutation = useMutation({
      mutationFn: (scheduleData: UpsertDoctorSchedulePayload & { scheduleId?: string }) => {
          if (!accessToken || !selectedDoctorId) throw new Error("Not authorized");
          
          if (scheduleData.scheduleId) {
              const { scheduleId, ...payload } = scheduleData;
              return updateDoctorSchedule(scheduleId, payload, accessToken);
          } else {
              return createDoctorSchedule(selectedDoctorId, scheduleData, accessToken);
          }
      },
      onSuccess: (data, variables) => {
          toast({ title: "Success", description: `Schedule ${variables.scheduleId ? 'updated' : 'created'} successfully.` });
          queryClient.invalidateQueries({ queryKey: ['doctorSchedules', selectedDoctorId] });
          setIsModalOpen(false);
      },
      onError: (error) => {
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
          queryClient.invalidateQueries({ queryKey: ['doctorSchedules', selectedDoctorId] });
      },
      onError: (error) => {
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
      // Here you could open a confirmation dialog first
      // For now, we'll just call the mutation directly
      deleteMutation.mutate(scheduleId);
  }

  return (
    <>
    <AddEditScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values) => {
            const payload: UpsertDoctorSchedulePayload & { scheduleId?: string } = values;
            if (selectedSchedule?.id) {
                payload.scheduleId = selectedSchedule.id;
            }
            upsertMutation.mutate(payload);
        }}
        initialData={selectedSchedule}
        isLoading={upsertMutation.isPending}
    />
    <Card>
      <CardHeader>
        <CardTitle>Doctor Schedules & Overrides</CardTitle>
        <CardDescription>
          Manage recurring weekly schedules and individual overrides for each doctor at this clinic.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full max-w-sm">
          <Label htmlFor="doctor-selector">Select a Doctor</Label>
          {isLoadingDoctors ? (
              <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={setSelectedDoctorId} value={selectedDoctorId ?? undefined}>
                <SelectTrigger id="doctor-selector">
                <SelectValue placeholder="Select a doctor..." />
                </SelectTrigger>
                <SelectContent>
                {doctors && doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.fullName}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          )}
          {doctorsError && <p className="text-sm text-destructive mt-1">{doctorsError.message}</p>}
        </div>
        
        {selectedDoctorId && (
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
                                <TableRow><TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                            ) : schedulesError ? (
                                <TableRow><TableCell colSpan={4} className="text-destructive text-center">{schedulesError.message}</TableCell></TableRow>
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
                                                    <DropdownMenuItem onClick={() => handleDeleteConfirmation(schedule.id)} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">No recurring schedule found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}

        {!selectedDoctorId && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Select a doctor to view and manage their schedule.</p>
            </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};


// Add/Edit Modal
interface AddEditScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: UpsertDoctorSchedulePayload) => void;
    initialData: DoctorSchedule | null;
    isLoading: boolean;
}

const AddEditScheduleModal: React.FC<AddEditScheduleModalProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
    const [dayOfWeek, setDayOfWeek] = useState<number>(0);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        if (initialData) {
            setDayOfWeek(initialData.dayOfWeek);
            setStartTime(initialData.startTime);
            setEndTime(initialData.endTime);
        } else {
            setDayOfWeek(1); // Default to Monday
            setStartTime('09:00:00');
            setEndTime('17:00:00');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ dayOfWeek, startTime, endTime });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="dayOfWeek">Day of Week</Label>
                        <Select onValueChange={(val) => setDayOfWeek(Number(val))} value={String(dayOfWeek)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {WEEK_DAYS.map((day, i) => <SelectItem key={day} value={String(i)}>{day}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input id="startTime" type="time" step="1" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input id="endTime" type="time" step="1" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 