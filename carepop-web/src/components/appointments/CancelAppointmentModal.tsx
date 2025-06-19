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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cancelAppointment } from "@/lib/actions/appointment.actions";
import { useState, useTransition } from "react";
import { useRouter } from 'next/navigation';

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
  const [reason, setReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }

    startTransition(async () => {
      const result = await cancelAppointment(appointmentId, reason);
      if (result.success) {
        toast.success(`Successfully cancelled: ${appointmentName}.`);
        setIsOpen(false);
        setReason("");
        if (onCancellationSuccess) {
            onCancellationSuccess();
        } else {
            router.refresh(); 
        }
      } else {
        toast.error(result.message || "Could not cancel the appointment.");
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
            This action cannot be undone. Please provide a reason below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cancellationReason-modal" className="text-right">
              Reason
            </Label>
            <Input
              id="cancellationReason-modal"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Schedule conflict"
              disabled={isPending}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep Appointment</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isPending || !reason.trim()}>
            {isPending ? "Cancelling..." : "Confirm Cancellation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 