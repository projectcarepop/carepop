'use client';

import { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { deleteServiceCategory, getAllServiceCategories } from '@/lib/actions/service-categories.admin.actions';
import { useToast } from '@/components/ui/use-toast';
import { AppError } from '@/lib/utils/errors';
import { TServiceCategory } from '@/lib/types/service-category.types';

const ActionsCell = ({ category }: { category: TServiceCategory }) => {
  const { toast } = useToast();
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service category?')) return;
    if (!category.id) return; // Should not happen, but for type safety

    try {
      await deleteServiceCategory(category.id);
      toast({
        title: 'Success',
        description: `Service category "${category.name}" deleted successfully.`,
      });
      // This will trigger a re-fetch in the parent component
       window.dispatchEvent(new CustomEvent('serviceCategoryDeleted'));
    } catch (error) {
       const errorMessage = error instanceof AppError ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Error',
        description: `Failed to delete category: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/service-categories/${category.id}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TServiceCategory>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell category={row.original} />,
  },
];

export function ServiceCategoryTable() {
  const [data, setData] = useState<TServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([])

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getAllServiceCategories();
       if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching service categories:", error.message);
        } else {
            console.error("An unknown error occurred while fetching service categories");
        }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleCategoryDeleted = () => fetchData();
    window.addEventListener('serviceCategoryDeleted', handleCategoryDeleted);
    return () => {
        window.removeEventListener('serviceCategoryDeleted', handleCategoryDeleted);
    }
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.original.id}
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
                {isLoading ? "Loading..." : "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 p-4">
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