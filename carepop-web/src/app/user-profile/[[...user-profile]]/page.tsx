import { UserProfile } from '@clerk/nextjs';

const UserProfilePage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 py-12">
    <UserProfile path="/user-profile" routing="path" />
  </div>
);

export default UserProfilePage; 