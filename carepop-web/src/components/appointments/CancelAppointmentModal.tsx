"use client";

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
import { toast } from "sonner";
import { cancelMyAppointment } from "@/services/api";
import { useState, useTransition } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';

interface CancelAppointmentModalProps {
  appointmentId: string;
  appointmentName: string; 
  children: React.ReactNode; 
  onCancellationSuccess?: () => void;
}

export function CancelAppointmentModal({
  appointmentId,
  appointmentName,
  children,
  onCancellationSuccess
}: CancelAppointmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { session } = useAuth();

  const handleSubmit = async () => {
    if (!session?.access_token) {
      toast.error("You must be logged in to cancel an appointment.");
      return;
    }

    startTransition(async () => {
      try {
        await cancelMyAppointment(appointmentId, session.access_token);
        toast.success(`Successfully cancelled: ${appointmentName}.`);
        setIsOpen(false);
        if (onCancellationSuccess) {
          onCancellationSuccess();
        } else {
          router.refresh(); 
        }
      } catch (error) {
        toast.error((error as Error).message || "Could not cancel the appointment.");
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your appointment for &quot;{appointmentName}&quot;? 
            This action cannot be undone.
            <br />
            <span className="font-bold text-destructive mt-2 block">
              Please note: Appointments can only be cancelled up to 36 hours in advance.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep Appointment</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Cancelling..." : "Confirm Cancellation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 