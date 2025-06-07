import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ProfileForm } from './components/profile-form';
import { AppointmentsList } from './components/appointments-list';
import { MedicalRecordsList } from './components/medical-records-list';

async function getUserDetails(userId: string) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // This should be handled by middleware, but as a safeguard
    return null; 
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch user details');
  }

  return response.json();
}


export default async function UserDetailPage({ params }: { params: { userId: string } }) {
  const data = await getUserDetails(params.userId);

  if (!data) {
    return <div className="container mx-auto py-10">Could not load user data.</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { profile, appointments, medicalRecords } = data;
  const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User List
          </Link>
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{userName || 'User Details'}</h1>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
            <ProfileForm profile={profile} userId={params.userId} />
        </TabsContent>
        <TabsContent value="appointments">
            <AppointmentsList appointments={appointments} />
        </TabsContent>
        <TabsContent value="records">
            <MedicalRecordsList records={medicalRecords} userId={params.userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 