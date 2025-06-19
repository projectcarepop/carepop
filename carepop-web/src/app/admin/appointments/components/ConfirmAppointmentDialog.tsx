'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { confirmAppointment } from '@/lib/actions/appointments';

interface ConfirmAppointmentDialogProps {
  appointmentId: string;
  currentStatus: string;
}

export function ConfirmAppointmentDialog({ appointmentId, currentStatus }: ConfirmAppointmentDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const router = useRouter();

  if (currentStatus !== 'pending_confirmation') {
    return null; // Don't show the button if it's not pending confirmation
  }
  
  const handleConfirm = async () => {
    console.log(`[CLIENT] handleConfirm triggered for appointment: ${appointmentId}`);
    setIsConfirming(true);
    const result = await confirmAppointment(appointmentId);
    console.log('[CLIENT] Server action result:', result);
    if (result.success) {
      toast.success("Appointment Confirmed!", {
        description: result.message,
      });
      router.refresh(); // This will re-fetch the data for the page
    } else {
      toast.error("Error", {
        description: result.message,
      });
    }
    setIsConfirming(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Confirm Appointment
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will confirm the appointment. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? 'Confirming...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 