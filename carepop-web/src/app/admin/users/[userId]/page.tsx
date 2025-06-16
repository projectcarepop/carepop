// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { notFound } from 'next/navigation';
import { UserDetailTabs } from './components/user-detail-tabs';
import { getUserDetails } from './actions';

interface UserDetailPageProps {
  params: { userId: string };
}

const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const { profile } = await getUserDetails(params.userId);

  if (!profile) {
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
};

export default UserDetailPage; 