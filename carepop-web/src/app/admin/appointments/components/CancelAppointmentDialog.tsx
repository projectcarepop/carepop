'use client';

import { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cancelAppointmentAsAdmin } from '@/lib/actions/appointments';

interface CancelAppointmentDialogProps {
  appointmentId: string;
  currentStatus: string;
}

export function CancelAppointmentDialog({ appointmentId, currentStatus }: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error('A reason for cancellation is required.');
      return;
    }
    startTransition(async () => {
      const result = await cancelAppointmentAsAdmin(appointmentId, reason);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };
  
  if (currentStatus !== 'pending_confirmation' && currentStatus !== 'confirmed') {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
          Cancel Appointment
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cancel the appointment. This action cannot be undone. Please provide a reason below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid w-full gap-1.5">
            <Label htmlFor="reason">Reason for Cancellation</Label>
            <Textarea 
                id="reason" 
                placeholder="Type your reason here." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={isPending}>
            {isPending ? 'Cancelling...' : 'Confirm Cancellation'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 