'use client';

import { useState } from 'react';
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
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CancelAppointmentDialogProps {
  appointmentId: string;
  currentStatus: string;
}

export function CancelAppointmentDialog({ appointmentId, currentStatus }: CancelAppointmentDialogProps) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('A reason for cancellation is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/admin/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel appointment');
      }
      toast.success('Appointment cancelled successfully!');
      router.refresh(); // Refresh data on the page
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
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
          <AlertDialogAction onClick={handleCancel} disabled={isSubmitting}>
            {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 