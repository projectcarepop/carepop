'use client';

import { useState, useTransition } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteProviderAction } from '@/lib/actions/provider.actions';
import { toast } from 'sonner';

// This type must match the data structure returned by the API
interface ProviderData {
  id: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
  licenseNumber: string | null;
  acceptingNewPatients: boolean;
}

export function ProviderTableClient({ data }: { data: ProviderData[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (providerId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this provider? This action cannot be undone.'
      )
    ) {
      startTransition(async () => {
        const result = await deleteProviderAction(providerId);
        if (result?.success) {
          toast.success('Provider deleted successfully.');
        } else {
          toast.error('Failed to delete provider', {
            description: result.message,
          });
        }
      });
    }
  };

  const columns: ColumnDef<ProviderData>[] = [
    {
      accessorKey: 'profile',
      header: 'Name',
      cell: ({ row }) => {
        const provider = row.original;
        if (provider.profile) {
          const { firstName, lastName } = provider.profile;
          return `${firstName || ''} ${lastName || ''}`.trim() || 'N/A';
        }
        // If there is no profile, it's an unlinked provider.
        // We show a more descriptive message for clarity.
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-500 dark:text-gray-400">Unlinked Provider</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">ID: {provider.id}</span>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const searchTerm = (filterValue as string).toLowerCase();
        const profile = row.original.profile;

        if (profile) {
            const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
            return fullName.includes(searchTerm);
        }
        // Also allow filtering for unlinked providers by text or ID
        const searchText = 'unlinked provider ' + row.original.id;
        return searchText.includes(searchTerm);
      }
    },
    { accessorKey: 'licenseNumber', header: 'License #' },
    {
      accessorKey: 'acceptingNewPatients',
      header: 'Accepting Patients',
      cell: ({ row }) => (
        <Badge variant={row.original.acceptingNewPatients ? 'default' : 'secondary'}>
          {row.original.acceptingNewPatients ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/admin/providers/${row.original.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={() => handleDelete(row.original.id)}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name or 'unlinked'..."
          value={(table.getColumn('profile')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('profile')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}