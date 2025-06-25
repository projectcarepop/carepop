'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { getAdminUsers, updateUserRole } from '@/services/api';
import { columns } from './columns';
import { type AdminUser } from '@/lib/types';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';

interface UsersClientProps {
    initialData: AdminUser[];
}

export function UsersClient({ initialData }: UsersClientProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [newRole, setNewRole] = useState<'admin' | 'patient' | ''>('');

    const { data: users = [] } = useQuery<AdminUser[]>({
        queryKey: ['adminUsers'],
        queryFn: getAdminUsers,
        initialData: initialData,
    });

    const updateUserRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: 'admin' | 'patient' }) => updateUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast({ title: 'User role updated successfully' });
            setIsModalOpen(false);
        },
        onError: (error: Error) => toast({ title: 'Error updating role', description: error.message, variant: 'destructive' }),
    });

    const openEditRoleModal = (user: AdminUser) => {
        setSelectedUser(user);
        setNewRole(user.role as 'admin' | 'patient');
        setIsModalOpen(true);
    };

    const handleRoleChangeCommit = () => {
        if (selectedUser && newRole) {
            updateUserRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
        }
    };
    
    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            editUserRole: openEditRoleModal,
        }
    });

    return (
        <div>
             <div className="rounded-md border mt-4">
                <Table>
                    <TableHeader>{table.getHeaderGroups().map(hg => (<TableRow key={hg.id}>{hg.headers.map(h => (<TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No users found.</TableCell></TableRow>)}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Role for {selectedUser?.fullName}</AlertDialogTitle>
                        <AlertDialogDescription>Select a new role for this user. They will be granted permissions associated with the new role immediately.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={(value) => setNewRole(value as 'admin' | 'patient')}>
                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="patient">Patient</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRoleChangeCommit} disabled={updateUserRoleMutation.isPending}>
                            {updateUserRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 