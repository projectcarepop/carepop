'use client';

import { useEffect, useState, useMemo } from 'react';
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

interface ISupplier {
  id: string;
  name: string;
  contact_person?: string | null;
  contact_email?: string | null;
  is_active: boolean;
}

export function SuppliersList() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchSuppliers = useMemo(() => async () => {
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

      const response = await fetch(`/api/v1/admin/suppliers?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        throw new AppError('Failed to fetch suppliers', response);
      }

      const result = await response.json();
      setSuppliers(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase, page, searchTerm]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new AppError("Not authenticated", {} as Response);
      
      const response = await fetch(`/api/v1/admin/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        throw new AppError('Failed to delete supplier', response);
      }

      toast({
        title: "Success",
        description: "Supplier deleted successfully.",
      });
      fetchSuppliers(); // Refetch data

    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchSuppliers();
  };

  if (loading && suppliers.length === 0) return <p className="text-muted-foreground">Loading suppliers...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input 
            placeholder="Search by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">Search</Button>
        </form>
        <Button asChild>
          <Link href="/admin/inventory/suppliers/new">
            <PlusCircle className="mr-2 h-4 w-4" /> New Supplier
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length > 0 ? suppliers.map((supplier) => (
              <TableRow key={supplier.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contact_person || 'N/A'}</TableCell>
                <TableCell>{supplier.contact_email || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                    {supplier.is_active ? 'Active' : 'Inactive'}
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
                        <Link href={`/admin/inventory/suppliers/${supplier.id}/edit`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(supplier.id)} className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
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
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
          >
              Previous
          </Button>
          <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
          >
              Next
          </Button>
      </div>
    </div>
  );
} 