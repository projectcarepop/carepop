'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ProfileForm } from './components/profile-form';
import { MedicalRecordsList } from './components/medical-records-list';
import { AppointmentsList } from './components/appointments-list';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  // Add other profile fields as needed
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
  record_type: string;
  description: string | null;
  file_url: string;
  created_at: string;
  // Add other record fields as needed
}

interface UserData {
  profile: Profile;
  appointments: Appointment[];
  medical_records: MedicalRecord[];
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          throw new Error('Not authenticated.');
        }

        const response = await fetch(`/api/v1/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user data: ${errorText}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, supabase]);

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading user data...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10">Error: {error}</div>;
  }

  if (!userData) {
    return <div className="container mx-auto py-10">No user data found.</div>;
  }
  
  const userName = `${userData.profile.first_name || ''} ${userData.profile.last_name || ''}`.trim();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User List
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold">{userName || 'User Details'}</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileForm profile={userData.profile} userId={userId}/>
        </TabsContent>
        <TabsContent value="appointments">
          <AppointmentsList appointments={userData.appointments} />
        </TabsContent>
        <TabsContent value="records">
          <MedicalRecordsList 
            records={userData.medical_records} 
            userId={userId} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 