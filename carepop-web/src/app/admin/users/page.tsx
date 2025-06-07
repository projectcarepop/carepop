import { UserTable } from "./components/user-table";
import { Suspense } from "react";

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Suspense fallback={<div>Loading users...</div>}>
        <UserTable />
      </Suspense>
    </div>
  );
} 