import { UserTable } from "./components/user-table";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Suspense fallback={<div>Loading users...</div>}>
        <UserTable />
      </Suspense>
    </div>
  );
} 