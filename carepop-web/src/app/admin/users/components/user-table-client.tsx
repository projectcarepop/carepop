'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { User } from './user-table'; // Import the User type
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateUserRole } from '@/lib/actions/user.admin.actions';

interface UserTableClientProps {
    data: User[];
    totalRecords: number;
}

export function UserTableClient({ data, totalRecords }: UserTableClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentPerPage = Number(searchParams.get('per_page')) || 10;
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'createdAt.desc';

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: currentSort.split('.')[0], desc: currentSort.split('.')[1] === 'desc' },
  ]);

   const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleSearch = useDebouncedCallback((term: string) => {
    replace(`${pathname}?${createQueryString({ search: term || null, page: 1 })}`);
  }, 300);

  const handlePageChange = (pageIndex: number) => {
    replace(`${pathname}?${createQueryString({ page: pageIndex + 1 })}`);
  };

  const handlePageSizeChange = (pageSize: number) => {
    replace(`${pathname}?${createQueryString({ per_page: pageSize, page: 1 })}`);
  };

   React.useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0];
      const sortString = `${sort.id}.${sort.desc ? 'desc' : 'asc'}`;
      if (sortString !== currentSort) {
        replace(`${pathname}?${createQueryString({ sort: sortString, page: 1 })}`);
      }
    }
  }, [sorting, pathname, replace, createQueryString, currentSort]);

  const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
      startTransition(async () => {
          const result = await updateUserRole(userId, newRole);
          if(result.success) {
              toast.success(result.message);
          } else {
              toast.error(result.message);
          }
      });
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'lastName',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return <div className="font-medium">{name || 'N/A'}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return <Badge variant={role === 'admin' ? 'default' : 'secondary'}>{role}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Joined',
      cell: ({ row }) => new Date(row.getValue('createdAt') as string).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/users/${user.id}`}>View Details</Link>
                </DropdownMenuItem>
                 <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')} disabled={user.role === 'admin' || isPending}>
                        Set as Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')} disabled={user.role === 'user' || isPending}>
                        Set as User
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
        if (typeof updater === 'function') {
            const newPaginationState = updater({ pageIndex: currentPage - 1, pageSize: currentPerPage });
            if (newPaginationState.pageIndex !== currentPage - 1) {
                handlePageChange(newPaginationState.pageIndex);
            }
            if (newPaginationState.pageSize !== currentPerPage) {
                handlePageSizeChange(newPaginationState.pageSize);
            }
        }
    },
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: currentPerPage,
      },
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalRecords / currentPerPage),
  });

  return (
    <div className="w-full space-y-4">
       <Input
          placeholder="Search by name or email..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
} 