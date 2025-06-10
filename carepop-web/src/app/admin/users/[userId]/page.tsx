import { createClient } from '@/utils/supabase/server';
import { UserDetailTabs } from './components/user-detail-tabs';
import { notFound } from 'next/navigation';

export default async function UserDetailPage({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  
  // Fetch the basic user profile to ensure the user exists and for the profile tab
  const { data: profile, error } = await supabase
    .from('users_view')
    .select('*')
    .eq('id', params.userId)
    .single();

  if (error || !profile) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{profile.full_name}</h1>
        <p className="text-muted-foreground">User ID: {profile.id}</p>
      </div>
      <UserDetailTabs profile={profile} userId={params.userId} />
    </div>
  );
} 