'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/lib/contexts/auth-context";
import { getDoctorsByClinic } from "@/services/api";

import { DoctorScheduleManager } from "./DoctorScheduleManager";
import { DoctorOverridesManager } from './DoctorOverridesManager';
import { ClinicMasterCalendar } from "./ClinicMasterCalendar";
// TODO: Create and import ClinicOverridesManager
// import { ClinicOverridesManager } from "./ClinicOverridesManager";

interface BookingManagementClientProps {
    clinicId: string;
}

type Doctor = {
    id: string;
    fullName: string;
}

const DoctorSchedulesTab = ({ clinicId }: { clinicId: string }) => {
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const { session } = useAuth();
    const accessToken = session?.access_token;

    const { data: doctorsResponse, isLoading: isLoadingDoctors } = useQuery({
        queryKey: ['doctorsByClinic', clinicId],
        queryFn: () => {
            if (!accessToken) throw new Error("Not authorized");
            return getDoctorsByClinic(clinicId, accessToken);
        },
        select: (response: { data: Doctor[] }) => response.data,
        enabled: !!accessToken && !!clinicId,
    });
    
    const doctors = doctorsResponse || [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Doctor Selection</CardTitle>
                    <CardDescription>Select a doctor to manage their schedules and specific overrides.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full max-w-sm">
                        <Label htmlFor="doctor-selector">Select a Doctor</Label>
                        {isLoadingDoctors ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select onValueChange={setSelectedDoctorId} value={selectedDoctorId ?? undefined}>
                                <SelectTrigger id="doctor-selector">
                                <SelectValue placeholder="Select a doctor..." />
                                </SelectTrigger>
                                <SelectContent>
                                {doctors.map(doctor => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                        {doctor.fullName}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedDoctorId && (
                <Tabs defaultValue="schedules" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="schedules">Recurring Schedules</TabsTrigger>
                        <TabsTrigger value="overrides">One-off Overrides</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedules">
                        <DoctorScheduleManager doctorId={selectedDoctorId} />
                    </TabsContent>
                    <TabsContent value="overrides">
                        <DoctorOverridesManager doctorId={selectedDoctorId} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export const BookingManagementClient: React.FC<BookingManagementClientProps> = ({ clinicId }) => {
    return (
        <Tabs defaultValue="master-calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="master-calendar">Master Calendar</TabsTrigger>
                <TabsTrigger value="doctor-schedules">Doctor Schedules</TabsTrigger>
                <TabsTrigger value="clinic-overrides">Clinic-Wide Overrides</TabsTrigger>
            </TabsList>
            <TabsContent value="master-calendar">
                <Card>
                    <CardHeader>
                        <CardTitle>Clinic Master Calendar</CardTitle>
                        <CardDescription>A comprehensive, read-only view of all appointments, schedules, and clinic-wide events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClinicMasterCalendar clinicId={clinicId} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="doctor-schedules">
                <DoctorSchedulesTab clinicId={clinicId} />
            </TabsContent>
            <TabsContent value="clinic-overrides">
                <Card>
                    <CardHeader>
                        <CardTitle>Clinic-Wide Overrides</CardTitle>
                        <CardDescription>Manage holidays, closures, and other special events that affect the entire clinic.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* <ClinicOverridesManager clinicId={clinicId} /> */}
                        <p>Clinic-Wide Overrides Manager will go here.</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
} 