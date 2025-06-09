import { createClient } from '@/utils/supabase/server';
import { UserDetailTabs } from './components/user-detail-tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function UserDetailPage({ params: { userId } }: { params: { userId: string } }) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return notFound();
  }

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!apiUrl) {
    console.error('Backend API URL is not configured.');
    return notFound();
  }
  
  const [userResponse, medicalRecordsResponse] = await Promise.all([
    fetch(`${apiUrl}/api/v1/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    }),
    fetch(`${apiUrl}/api/v1/admin/users/${userId}/medical-records`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
    })
  ]);

  if (!userResponse.ok) {
    console.error(`Failed to fetch user data for ${userId}: ${userResponse.statusText}`);
    return notFound();
  }
  
  const userData = await userResponse.json();
  // We don't fail the whole page if medical records fail, just show an empty list.
  const medicalRecordsData = medicalRecordsResponse.ok ? await medicalRecordsResponse.json() : [];

  if (!userData) {
    return notFound();
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
      
      <UserDetailTabs 
        profile={userData.profile}
        appointments={userData.appointments || []}
        medicalRecords={medicalRecordsData.records || []}
        userId={userId}
      />
    </div>
  );
} 