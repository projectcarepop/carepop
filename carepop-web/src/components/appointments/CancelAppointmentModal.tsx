"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; // Corrected import path
import { cancelAppointmentAction } from "@/lib/actions/appointments";
import { useRouter } from 'next/navigation'; // For re-fetching data or redirecting

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
      const result = await cancelAppointmentAction(appointmentId, reason);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your appointment for &quot;{appointmentName}&quot;? 
            Please provide a reason below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cancellationReason" className="text-right">
              Reason
            </Label>
            <Input
              id="cancellationReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Schedule conflict"
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>Keep Appointment</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isPending || !reason.trim()}>
            {isPending ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 