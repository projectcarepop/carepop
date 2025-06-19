'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from './profile-form';
import { MedicalRecordsList } from './medical-records-list';
import { AppointmentsList } from './appointments-list';
import { UserProfile } from "@/lib/contexts/AuthContext";

interface UserDetailTabsProps {
  profile: UserProfile;
  userId: string;
}

export function UserDetailTabs({ profile, userId }: UserDetailTabsProps) {
  return (
    <Tabs defaultValue="profile">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="appointments">Appointments</TabsTrigger>
        <TabsTrigger value="records">Medical Records</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileForm profile={profile} />
      </TabsContent>
      <TabsContent value="appointments">
        <AppointmentsList userId={userId} />
      </TabsContent>
      <TabsContent value="records">
        <MedicalRecordsList userId={userId} />
      </TabsContent>
    </Tabs>
  );
} 