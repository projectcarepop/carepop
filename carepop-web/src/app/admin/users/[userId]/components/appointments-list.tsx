'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentSubTable } from './AppointmentSubTable';

interface AppointmentsListProps {
  userId: string;
}

export function AppointmentsList({ userId }: AppointmentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
        <CardDescription>A list of the user&apos;s past and upcoming appointments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
              <AppointmentSubTable userId={userId} type="upcoming" />
          </TabsContent>
          <TabsContent value="past">
              <AppointmentSubTable userId={userId} type="past" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 