'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

import { getAdminUsers, updateUserRole } from '@/services/api';
import { useDebounce } from 'use-debounce';
import { DataTable } from '@/components/ui/data-table';
import { type AdminUser } from '@/services/api';
import { columns } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserRoleForm } from './UserRoleForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UsersClientProps {
  initialUsers: any; // Allow any for initial data to handle paginated response
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | undefined>(undefined);
  const [globalFilter, setGlobalFilter] = React.useState('');
  
  // Server-side filtering and pagination state
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [debouncedFilter] = useDebounce(globalFilter, 500);

  const queryKey = ['adminUsers', pagination, debouncedFilter];

  const {
    data: usersResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => getAdminUsers(session!.access_token, {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      q: debouncedFilter || undefined,
    }),
    initialData: initialUsers,
    enabled: !!session,
  });

  const users = usersResponse?.data || [];
  const pageCount = usersResponse?.pagination?.totalPages ?? 0;

  const updateRoleMutation = useMutation({
    mutationFn: (data: { userId: string; role: 'patient' | 'admin' | 'manager' }) => {
      return updateUserRole(data, session!.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Success!',
        description: 'User role has been updated.',
      });
      setIsModalOpen(false);
      setSelectedUser(undefined);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleEditRole = (user: AdminUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const dynamicColumns = React.useMemo(() => columns({ onEditRole: handleEditRole }), []);

  if (isError) return <div>Failed to load users: {error?.message}</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <CardHeader className="p-0">
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>
          View all registered users and manage their roles on the platform.
        </CardDescription>
      </CardHeader>
      
      <DataTable
        columns={dynamicColumns}
        data={users || []}
        pageCount={pageCount}
        pagination={pagination}
        setPagination={setPagination as React.Dispatch<React.SetStateAction<any>>}
        isLoading={isLoading}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <UserRoleForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={selectedUser}
            onSubmit={(values) => {
              if (selectedUser) {
                updateRoleMutation.mutate({ userId: selectedUser.id, role: values.role });
              }
            }}
            isPending={updateRoleMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 