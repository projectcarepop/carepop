"use client";

import { useState, useTransition } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cancelAppointment } from "@/lib/actions/appointments";
import { useRouter } from 'next/navigation';

interface CancelAppointmentModalProps {
  appointmentId: string;
  appointmentName: string; // e.g., "Service Name at Clinic Name"
  children: React.ReactNode; // This will be the trigger button
  onCancellationSuccess?: () => void; // Callback for successful cancellation
}

export default function CancelAppointmentModal({
  appointmentId,
  appointmentName,
  children,
  onCancellationSuccess
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancellation.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await cancelAppointment(appointmentId);
      if (result.success) {
        toast({
          title: "Appointment Cancelled",
          description: `Successfully cancelled: ${appointmentName}.`,
        });
        setIsOpen(false);
        setReason("");
        if (onCancellationSuccess) {
            onCancellationSuccess();
        } else {
            // Fallback refresh if no specific callback provided
            router.refresh(); 
        }
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.message || "Could not cancel the appointment.",
          variant: "destructive",
        });
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