'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { AppError, getErrorMessage } from '@/lib/utils';

interface IInventoryItem {
  id: string;
  item_name: string;
  category?: string | null;
  sku?: string | null;
  quantity_on_hand: number;
  is_active: boolean;
  supplier?: {
    id: string;
    name: string;
  } | null;
}

export function InventoryItemsList() {
  const supabase = createSupabaseBrowserClient();
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        });

        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        const response = await fetch(`/api/v1/admin/inventory-items?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });

        if (!response.ok) {
          throw new AppError('Failed to fetch inventory items', response);
        }

        const result = await response.json();
        setItems(result.data);
        setTotalPages(result.totalPages);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        toast({
          title: 'Error fetching items',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [supabase, page, searchTerm, toast]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const response = await fetch(`/api/v1/admin/inventory-items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        throw new AppError('Failed to delete item', response);
      }

      setItems(items.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Item successfully deleted."
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: 'Error deleting item',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    // The useEffect hook will trigger the fetch
  };

  if (loading) return <p>Loading inventory items...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            placeholder="Search by name, SKU, etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">Search</Button>
        </form>
        <Button asChild>
          <Link href="/admin/inventory/items/new">
            <PlusCircle className="mr-2 h-4 w-4" /> New Item
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Qty On Hand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item_name}</TableCell>
                <TableCell>{item.sku || 'N/A'}</TableCell>
                <TableCell>{item.category || 'N/A'}</TableCell>
                <TableCell>{item.quantity_on_hand}</TableCell>
                <TableCell>
                  <Badge variant={item.is_active ? 'default' : 'destructive'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/inventory/items/${item.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

       <div className="flex items-center justify-end space-x-4 py-4">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page <= 1}
          >
              Previous
          </Button>
          <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
          >
              Next
          </Button>
      </div>
    </div>
  );
} 