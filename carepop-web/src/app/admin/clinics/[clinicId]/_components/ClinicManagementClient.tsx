'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceDoctorAssignments, Assignments } from './ServiceDoctorAssignments';
import { updateClinicDoctorAssignments } from '@/services/api';


// This type should match the data structure returned by our new backend endpoint.
type ManagementContext = {
  clinic: {
    id: string;
    name: string;
    street: string | null;
    cityMunicipalityCode: string | null;
    provinceCode: string | null;
    zipCode: string | null;
    phoneNumber: string | null;
    services: { service: { id: string; name: string } }[];
    // This now represents the full doctor_clinic_services relationship
    doctorClinicServices: {
      doctorId: string;
      serviceId: string;
    }[];
  };
  allServices: { id: string; name: string }[];
  allDoctors: { id: string; fullName: string }[];
};

interface ClinicManagementClientProps {
  initialContext: ManagementContext;
}

const ClinicDetails = ({ clinic }: { clinic: ManagementContext['clinic'] }) => {
    const address = [
        clinic.street,
        clinic.cityMunicipalityCode,
        clinic.provinceCode,
        clinic.zipCode
    ].filter(Boolean).join(', ');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clinic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p><strong>Name:</strong> {clinic.name}</p>
                <p><strong>Address:</strong> {address || 'Not available'}</p>
                <p><strong>Phone:</strong> {clinic.phoneNumber || 'Not available'}</p>
            </CardContent>
        </Card>
    );
};

export function ClinicManagementClient({ initialContext }: ClinicManagementClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { clinic, allDoctors } = initialContext;

  const [assignments, setAssignments] = useState<Assignments>(() => {
    // Transform the initial flat array into the nested map structure
    return initialContext.clinic.doctorClinicServices.reduce((acc, current) => {
      const { serviceId, doctorId } = current;
      if (!acc[serviceId]) {
        acc[serviceId] = [];
      }
      acc[serviceId].push(doctorId);
      return acc;
    }, {} as Assignments);
  });

  const { mutate: saveAssignments, isPending } = useMutation({
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


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Link href="/admin/clinics" className="flex items-center text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Clinics
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage {clinic.name}</h1>
        <p className="text-lg text-muted-foreground">Update clinic details and manage service-doctor assignments.</p>
      </div>

      <Separator />

      <ClinicDetails clinic={clinic} />

      <Separator />

      <ServiceDoctorAssignments 
        assignedServices={clinic.services.map(s => s.service)}
        allDoctors={allDoctors}
        initialAssignments={assignments}
        onAssignmentsChange={setAssignments}
      />
      
      <div className="flex justify-end">
        <Button onClick={() => saveAssignments(assignments)} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 