'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from "@/components/ui/switch";
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { getAdminProducts, upsertProduct, updateStock } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { AdminProduct } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';

// --- Child Components for the Table ---

function ActiveToggle({ product }: { product: AdminProduct }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const supabase = createClient();

    const mutation = useMutation({
        mutationFn: (newStatus: boolean) => upsertProduct(supabase, { isActive: newStatus }, product.id),
        onSuccess: () => {
            toast({ title: 'Success!', description: 'Product status updated.' });
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        },
        onError: (error) => toast({ title: 'Error', description: error.message, variant: 'destructive' }),
    });

    return <Switch checked={product.isActive} onCheckedChange={mutation.mutate} disabled={mutation.isPending} />;
}

function StockInput({ product }: { product: AdminProduct }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const supabase = createClient();
    const [quantity, setQuantity] = useState(product.quantityOnHand);

    const debouncedQuantity = useDebounce(quantity, 500);

    const { mutate, isPending } = useMutation({
        mutationFn: (newQuantity: number) => updateStock(supabase, product.id, newQuantity),
        onSuccess: () => {
            toast({ title: 'Success!', description: 'Stock updated.' });
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        },
        onError: (error) => toast({ title: 'Error', description: error.message, variant: 'destructive' }),
    });

    // Effect to trigger mutation when debounced value changes
    useState(() => {
        if (debouncedQuantity !== product.quantityOnHand) {
            mutate(debouncedQuantity);
        }
    });

    return (
        <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24"
            disabled={isPending}
        />
    );
}

// --- Column Definitions ---

export const columns: ColumnDef<AdminProduct>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  { accessorKey: 'categoryName', header: 'Category' },
  { accessorKey: 'price', header: 'Price', cell: ({ row }) => `₱${row.original.price}` },
  { 
    accessorKey: 'quantityOnHand', 
    header: 'Stock',
    cell: ({ row }) => <StockInput product={row.original} />
  },
  { 
    accessorKey: 'isActive', 
    header: 'Active',
    cell: ({ row }) => <ActiveToggle product={row.original} />
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit Product</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// --- Main Client Component ---

interface InventoryManagementClientProps {
    initialProducts: AdminProduct[];
}

export function InventoryManagementClient({ initialProducts }: InventoryManagementClientProps) {
    const supabase = createClient();
    const { data: products } = useQuery({
        queryKey: ['adminProducts'],
        queryFn: () => getAdminProducts(supabase),
        initialData: initialProducts,
    });
  
  return <DataTable columns={columns} data={products || []} />;
} 