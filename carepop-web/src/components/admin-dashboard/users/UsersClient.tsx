'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { apiClient } from '@/lib/apiClient';
import { useToast } from "@/components/ui/use-toast";

import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { type UserProfile } from '@/types/app';

interface UsersClientProps {
    initialData: UserProfile[];
}

export function UsersClient({ initialData }: UsersClientProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [newRole, setNewRole] = useState<'admin' | 'patient' | ''>('');

    // --- Data Fetching ---
    const { data: users = [] } = useQuery<UserProfile[]>({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const res = await apiClient.api.admin.users.$get();
            if (!res.ok) throw new Error('Failed to fetch users');
            const { data } = await res.json();
            return data;
        },
        initialData: initialData,
    });

    // --- Mutation ---
    const updateUserRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: 'admin' | 'patient' }) => {
            return apiClient.api.admin.users[userId].role.$put({ json: { role } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast({ title: 'User role updated successfully' });
            setIsModalOpen(false);
            setSelectedUser(null);
        },
        onError: (error) => toast({ title: 'Error updating role', description: error.message, variant: 'destructive' }),
    });

    // --- Event Handlers ---
    const openEditRoleModal = (user: UserProfile) => {
        setSelectedUser(user);
        setNewRole(user.role as 'admin' | 'patient');
        setIsModalOpen(true);
    };

    const handleRoleChangeCommit = () => {
        if (selectedUser && newRole) {
            updateUserRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
        }
    };
    
    // --- Table Columns ---
    // Defined inside the component to have access to the open modal handler
    const columns: ColumnDef<UserProfile>[] = [
        { accessorKey: "fullName", header: "Full Name" },
        { accessorKey: "email", header: "Email" },
        { 
            accessorKey: "role", 
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as string;
                return <Badge variant={role === 'admin' ? 'default' : 'secondary'}>{role}</Badge>;
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditRoleModal(row.original)}>Edit Role</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
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
                            {updateUserRoleMutation.isPending && <MoreHorizontal className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 