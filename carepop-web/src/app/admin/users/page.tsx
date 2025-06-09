import { UserTable } from "./components/user-table";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button asChild>
          <Link href="/admin/users/new">
             <PlusCircle className="mr-2 h-4 w-4" /> Create New User
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        View and manage all registered users in the system.
      </p>
      <Suspense fallback={<div>Loading users...</div>}>
        <UserTable />
      </Suspense>
    </div>
  );
} 