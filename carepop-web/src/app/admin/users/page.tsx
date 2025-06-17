import { UserTable } from "./components/user-table";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { z } from 'zod';

const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

interface AdminUsersPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const parsedSearchParams = searchParamsSchema.parse(searchParams);

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
        <UserTable {...parsedSearchParams} />
      </Suspense>
    </div>
  );
} 