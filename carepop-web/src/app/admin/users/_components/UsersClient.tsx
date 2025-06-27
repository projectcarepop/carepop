'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '@/lib/contexts/AdminContext';
import { toast } from '@/hooks/use-toast';

import { getAdminUsers, updateUserRole } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type AdminUser } from '@/lib/types';
import { columns } from './columns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserRoleForm } from './UserRoleForm';

export default function UsersClient() {
  const { session } = useAdmin();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | undefined>(
    undefined
  );

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => getAdminUsers(session?.access_token),
    enabled: !!session, // Ensures query does not run until session is loaded
    staleTime: 1000 * 60, // 1 minute
  });

  const updateRoleMutation = useMutation({
    mutationFn: (userData: { userId: string, role: 'admin' | 'patient' }) =>
      updateUserRole(userData, session?.access_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Success!',
        description: 'User role has been updated.',
      });
      setIsModalOpen(false);
      setSelectedUser(undefined);
    },
    onError: (error) => {
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

  const dynamicColumns = React.useMemo(() => columns(handleEditRole), []);

  if (isError) return <div>Failed to load users: {error?.message}</div>;

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Select a new role for{' '}
              <span className="font-semibold">{selectedUser?.fullName}</span>.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserRoleForm
              initialData={selectedUser}
              onSubmit={(values) => {
                updateRoleMutation.mutate({
                  userId: selectedUser.id,
                  role: values.role,
                });
              }}
              isPending={updateRoleMutation.isPending}
            />
          )}
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