'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteServiceDialog } from './DeleteServiceDialog';

// This type should ideally come from a central types file
interface Service {
    id: string;
    name: string;
    description: string;
    cost: number;
    category: { name: string } | null;
    is_active: boolean;
}

interface ServiceListClientProps {
    data: Service[];
    totalRecords: number;
}

export function ServiceListClient({ data, totalRecords }: ServiceListClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedServiceId, setSelectedServiceId] = React.useState<string | null>(null);

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentPerPage = Number(searchParams.get('per_page')) || 10;
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'name.asc';

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

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'category.name',
      header: 'Category',
       cell: ({ row }) => row.original.category?.name || 'N/A',
    },
    {
        accessorKey: 'cost',
        header: 'Cost',
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('cost'));
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);
            return <div>{formatted}</div>
        }
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (row.getValue('is_active') ? 'Active' : 'Inactive'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const service = row.original;
        return (
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
                <Link href={`/admin/services/${service.id}/edit`}>Edit Service</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => {
                  setSelectedServiceId(service.id);
                  setDialogOpen(true);
                }}
              >
                Delete Service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalRecords / currentPerPage),
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: currentPerPage,
      },
    },
    onSortingChange: setSorting,
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
  });

  return (
    <div className="w-full space-y-4">
       <Input
        placeholder="Search by service name..."
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
                  {'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      {selectedServiceId && (
        <DeleteServiceDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            serviceId={selectedServiceId}
        />
      )}
    </div>
  );
} 