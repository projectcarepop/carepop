'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

import { getAdminUsers, updateUserRole } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type AdminUser } from '@/services/api';
import { columns } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserRoleForm } from './UserRoleForm';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UsersClientProps {
  initialUsers: AdminUser[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | undefined>(undefined);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => getAdminUsers(session!.access_token),
    initialData: initialUsers,
    enabled: !!session,
  });

  const updateRoleMutation = useMutation({
    mutationFn: (data: { userId: string; role: 'patient' | 'admin' }) => {
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
    <>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>
          View all registered users and manage their roles on the platform.
        </CardDescription>
      </CardHeader>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Edit User Role</DialogTitle>
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
      
      <DataTable
        columns={dynamicColumns}
        data={users || []}
        filterColumn="fullName"
        filterPlaceholder="Filter by name..."
        isLoading={isLoading}
      />
    </>
  );
} 