'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from './profile-form';
import { MedicalRecordsList } from './medical-records-list';
import { AppointmentsList } from './appointments-list';

// Define the interfaces for the props
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  // Add other profile fields as needed from your actual data structure
}

interface Appointment {
  id: string;
  appointment_datetime: string;
  status: string;
  service?: { name: string };
  clinic?: { name: string };
  provider?: { name: string };
}

interface MedicalRecord {
  id: string;
  record_title: string;
  record_details: string | null;
  record_file_url: string;
  created_at: string;
}

interface UserDetailTabsProps {
  profile: Profile;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  userId: string;
}

export function UserDetailTabs({ profile, appointments, medicalRecords, userId }: UserDetailTabsProps) {
  return (
    <Tabs defaultValue="profile">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="appointments">Appointments</TabsTrigger>
        <TabsTrigger value="records">Medical Records</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileForm profile={profile} userId={userId} />
      </TabsContent>
      <TabsContent value="appointments">
        <AppointmentsList appointments={appointments} />
      </TabsContent>
      <TabsContent value="records">
        <MedicalRecordsList 
          records={medicalRecords} 
          userId={userId} 
        />
      </TabsContent>
    </Tabs>
  );
} 