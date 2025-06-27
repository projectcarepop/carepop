'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/lib/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

import { getAdminUsers, updateUserRole } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { AdminUser } from '@/lib/types';
import { columns } from './columns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserRoleForm } from './UserRoleForm';

interface UsersClientProps {
  data: AdminUser[];
}

export default function UsersClient({ data }: UsersClientProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | undefined>(
    undefined
  );

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => getAdminUsers(supabase),
    initialData: data,
    staleTime: 1000 * 60, // 1 minute
  });

  const updateRoleMutation = useMutation({
    mutationFn: (userData: Parameters<typeof updateUserRole>[1]) =>
      updateUserRole(supabase, userData),
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

  if (isError) return <div>Failed to load users.</div>;

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