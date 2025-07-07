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
import { DoctorAvailabilityCalendar } from "./DoctorAvailabilityCalendar";


interface BookingManagementClientProps {
    clinicId: string;
}

type Doctor = {
    id: string;
    fullName: string;
}

export const BookingManagementClient: React.FC<BookingManagementClientProps> = ({ clinicId }) => {
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
                    <CardDescription>Select a doctor to manage their schedules, overrides, or view their calendar.</CardDescription>
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

            {selectedDoctorId ? (
                 <Tabs defaultValue="schedules">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="schedules">Schedules</TabsTrigger>
                        <TabsTrigger value="overrides">Overrides</TabsTrigger>
                        <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedules">
                        <DoctorScheduleManager doctorId={selectedDoctorId} />
                    </TabsContent>
                    <TabsContent value="overrides">
                        <DoctorOverridesManager doctorId={selectedDoctorId} />
                    </TabsContent>
                    <TabsContent value="calendar">
                        <DoctorAvailabilityCalendar doctorId={selectedDoctorId} />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Please select a doctor to continue.</p>
                </div>
            )}
        </div>
    )
} 