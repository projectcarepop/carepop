import { notFound } from 'next/navigation';
import { UserDetailTabs } from './components/user-detail-tabs';
import { getUserDetails } from './actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface UserDetailPageProps {
  params: { userId: string };
}

const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const { userId } = params;
  const { profile } = await getUserDetails(userId);

  if (!profile) {
    notFound();
  }

  // The 'full_name' and 'id' might not be directly on the UserProfile from AuthContext.
  // Let's ensure we are accessing properties that exist. The view 'users_view' should provide these.
  const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{profile.full_name}</h1>
        <p className="text-muted-foreground">User ID: {profile.id}</p>
      </div>
      <UserDetailTabs profile={profile} userId={userId} />
    </div>
  );
};

export default UserDetailPage; 