import UsersClient from './_components/UsersClient';

export default function ManageUsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            A list of all users in the system.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <UsersClient />
      </div>
    </div>
  );
}
