'use client';

import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { Clinic, Doctor, Service } from '@/lib/types';
import { ServiceDoctorAssignments, Assignments } from './ServiceDoctorAssignments';
import { ClinicForm } from '../../_components/ClinicForm'; // Corrected path
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { updateClinicDoctorAssignments } from '@/services/api';

// Define a more specific type for the context we expect
type ManagementContext = {
  clinic: Clinic;
  assignedServices: Service[];
  assignedDoctors: Doctor[];
  doctorServiceAssignments: {
    doctorId: string;
    serviceId: string;
  }[];
};

interface ClinicManagementClientProps {
  initialContext: ManagementContext;
}

export function ClinicManagementClient({ initialContext }: ClinicManagementClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [clinic] = useState(initialContext.clinic);
  const [assignments, setAssignments] = useState<Assignments>(() => {
    // Transform the initial flat array into a map of serviceId -> doctorId[]
    return initialContext.doctorServiceAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.serviceId]) {
        acc[assignment.serviceId] = [];
      }
      acc[assignment.serviceId].push(assignment.doctorId);
      return acc;
    }, {} as Assignments);
  });

  const handleAssignmentsChange = (newAssignments: Assignments) => {
    setAssignments(newAssignments);
  };
  
  const { mutate: saveAssignments, isPending: isSavingAssignments } = useMutation({
    mutationFn: (newAssignments: Assignments) => {
        if (!session) throw new Error("Not authenticated");
        return updateClinicDoctorAssignments({
            clinicId: clinic.id,
            assignments: newAssignments,
            token: session.access_token,
        });
    },
    onSuccess: () => {
        toast({ title: "Success", description: "Doctor assignments have been updated." });
        queryClient.invalidateQueries({ queryKey: ['clinicManagementContext', clinic.id] });
    },
    onError: (error) => {
        toast({ title: "Error", description: `Failed to update assignments: ${error.message}`, variant: "destructive" });
    }
  });

  const handleClinicSubmit = async (values: any) => {
      // This is a placeholder for the clinic details update logic
      console.log("Clinic details submitted", values);
      // In a real scenario, this would also be a mutation
      // For now, we just log it.
      return null;
  }
  
  const handleSaveChanges = () => {
      // For now, we only save the assignments.
      // A more robust implementation would save both clinic details and assignments
      // and handle the combined loading/error states.
      saveAssignments(assignments);
  }
  
  const isLoading = isSavingAssignments;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Clinic</h1>
        <p className="text-lg text-muted-foreground">{clinic.name}</p>
      </div>

      <Separator />

      {/* Section 1: Clinic Details */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Clinic Details</h2>
        <ClinicForm
            initialData={clinic}
            onSubmit={handleClinicSubmit}
            isPending={false} // Will be wired up in the next step
        />
      </div>

      <Separator />

      {/* Section 2: Service & Doctor Assignments */}
       <div>
        <h2 className="text-2xl font-semibold mb-4">Service & Doctor Assignments</h2>
         <ServiceDoctorAssignments
            services={initialContext.assignedServices}
            doctors={initialContext.assignedDoctors}
            initialAssignments={assignments}
            onAssignmentsChange={handleAssignmentsChange}
            isLoading={false} // Will be wired up in the next step
         />
      </div>
      
      <Separator />

      <div className="flex justify-end">
          <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
          </Button>
      </div>
    </div>
  );
} 