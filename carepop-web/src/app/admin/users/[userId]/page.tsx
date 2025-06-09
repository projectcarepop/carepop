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
  
  const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(`Failed to fetch user data for ${userId}: ${response.statusText}`);
    return notFound();
  }
  
  const userData = await response.json();

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
        appointments={userData.appointments}
        medicalRecords={userData.medical_records}
        userId={userId}
      />
    </div>
  );
} 