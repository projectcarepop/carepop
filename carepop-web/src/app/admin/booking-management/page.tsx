'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminClinics } from '@/services/api'; 
import { ClinicSelector } from './_components/ClinicSelector';
import { useAuth } from '@/lib/contexts/auth-context';
import { ClinicOverridesManager } from './_components/ClinicOverridesManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, User } from 'lucide-react';
import { DoctorScheduleManager } from './_components/DoctorScheduleManager';

const BookingManagementPage = () => {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const { data: clinics, isLoading: isLoadingClinics, error: clinicsError } = useQuery({
    queryKey: ['adminClinics'],
    queryFn: () => {
        if (!accessToken) throw new Error("Not authorized");
        return getAdminClinics(accessToken);
    },
    enabled: !!accessToken,
  });

  const handleClinicChange = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    // In the future, this will trigger refetching data for the selected clinic
  };

  const clinicList = useMemo(() => clinics?.data || [], [clinics]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">Manage clinic-wide holidays and doctor-specific availability.</p>
      </div>

      <ClinicSelector
        selectedClinicId={selectedClinicId}
        onClinicChange={handleClinicChange}
        clinics={clinicList}
        isLoading={isLoadingClinics}
      />
      
      {clinicsError && <p className="text-destructive">Failed to load clinics.</p>}

      {selectedClinicId ? (
        <Tabs defaultValue="clinic" className="mt-6">
            <TabsList>
                <TabsTrigger value="clinic"><Building className="mr-2 h-4 w-4"/>Clinic-Wide Overrides</TabsTrigger>
                <TabsTrigger value="doctor"><User className="mr-2 h-4 w-4"/>Doctor Schedules</TabsTrigger>
            </TabsList>
            <TabsContent value="clinic">
                <ClinicOverridesManager clinicId={selectedClinicId} />
            </TabsContent>
            <TabsContent value="doctor">
                <DoctorScheduleManager clinicId={selectedClinicId} />
            </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg mt-6">
            <p className="text-muted-foreground">Please select a clinic to begin.</p>
        </div>
      )}
    </div>
  );
};

export default BookingManagementPage; 