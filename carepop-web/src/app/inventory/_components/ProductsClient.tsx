'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';
import { 
  getInventoryForClinic, 
  getProductCategories,
  upsertInventoryItem,
  deleteInventoryItem,
} from '@/services/api';
import { type InventoryItem } from '@/lib/types/inventory';
import { productColumns } from './columns';
import { ProductForm, type ProductFormValues } from './ProductForm';
import { UpdateStockForm, type UpdateStockFormValues } from './UpdateStockForm';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ClinicSelector } from './ClinicSelector';
import { getAdminClinics } from '@/services/api';


export default function ProductsClient() {
  const { toast } = useToast();
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedClinicId = searchParams.get('clinicId');

  const [globalFilter, setGlobalFilter] = React.useState('');
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [sheetMode, setSheetMode] = React.useState<'addProduct' | 'editProduct' | 'updateStock' | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);

  const queryClient = useQueryClient();

    const { data: clinics, isLoading: isLoadingClinics } = useQuery({
        queryKey: ['admin-clinics'],
        queryFn: () => getAdminClinics(accessToken!),
        enabled: !!accessToken,
    });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['inventory-items', selectedClinicId, { lowStock: showLowStockOnly, expiringSoon: showExpiringSoon }],
    queryFn: () => {
        if (!selectedClinicId || !accessToken) return Promise.resolve({ data: [] });
        return getInventoryForClinic(selectedClinicId, accessToken, {
            lowStock: showLowStockOnly,
            expiringSoon: showExpiringSoon,
        });
    },
    enabled: !!accessToken && !!selectedClinicId,
    select: (data) => data.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: () => getProductCategories(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  const handleMutationSuccess = (entity: string) => {
    toast({ title: `${entity} saved successfully.` });
    setIsSheetOpen(false);
    queryClient.invalidateQueries({ queryKey: ['inventory-items', selectedClinicId] });
  };

  const handleMutationError = (error: Error, entity: string) => {
    toast({ title: `Error saving ${entity}`, description: error.message, variant: 'destructive' });
  };

  const productMutation = useMutation({
    mutationFn: (data: { item: ProductFormValues; id?: string }) => {
        const { sellingPrice, purchasePrice, expiryDate, ...rest } = data.item;
        
        const payload = {
            ...rest,
            sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        };
        return upsertInventoryItem(selectedClinicId!, payload, accessToken!, data.id);
    },
    onSuccess: () => handleMutationSuccess('Product'),
    onError: (error) => handleMutationError(error, 'Product'),
  });

  const stockUpdateMutation = useMutation({
    mutationFn: (data: { values: UpdateStockFormValues, id: string }) => {
      const payload = {
        quantityOnHand: data.values.quantityOnHand,
      };
      return upsertInventoryItem(selectedClinicId!, payload, accessToken!, data.id);
    },
    onSuccess: () => handleMutationSuccess('Stock'),
    onError: (error) => handleMutationError(error, 'Stock'),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (item: InventoryItem) => deleteInventoryItem(selectedClinicId!, item.id, accessToken!),
    onSuccess: () => {
        toast({ title: 'Product deleted successfully.' });
        queryClient.invalidateQueries({ queryKey: ['inventory-items', selectedClinicId] });
    },
    onError: (error) => handleMutationError(error, 'Product deletion'),
  });

  const handleOpenSheet = React.useCallback((
    mode: 'addProduct' | 'editProduct' | 'updateStock', 
    item?: InventoryItem
  ) => {
    setSheetMode(mode);
    setSelectedItem(item || null);
    setIsSheetOpen(true);
  }, []);
  
  const handleDeleteProduct = (item: InventoryItem) => {
    deleteProductMutation.mutate(item);
  }
  
  const handleClinicSelect = (clinicId: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (clinicId) {
          params.set('clinicId', clinicId);
      } else {
          params.delete('clinicId');
      }
      router.push(`${pathname}?${params.toString()}`);
  }

  const columns = React.useMemo(() => productColumns({
    onEdit: (item) => handleOpenSheet('editProduct', item),
    onDelete: handleDeleteProduct,
    onUpdateStock: (item) => handleOpenSheet('updateStock', item)
  }), [handleOpenSheet]);

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Products</h1>
                <p className="text-muted-foreground">
                    View, add, and manage product inventory for a selected clinic.
                </p>
            </div>
            <ClinicSelector
                clinics={clinics || []}
                selectedClinicId={selectedClinicId}
                onClinicSelect={handleClinicSelect}
                isLoading={isLoadingClinics || !accessToken}
            />
        </div>
        
      {!selectedClinicId ? (
        <Card className="flex items-center justify-center h-48">
            <CardContent className="pt-6">
                <p className="text-muted-foreground">Please select a clinic to view products.</p>
            </CardContent>
        </Card>
      ) : (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>Add, edit, and manage your product inventory.</CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                <Checkbox
                    id="low-stock"
                    checked={showLowStockOnly}
                    onCheckedChange={(checked) => setShowLowStockOnly(!!checked)}
                />
                <Label htmlFor="low-stock" className="whitespace-nowrap">Low Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                <Checkbox
                    id="expiring-soon"
                    checked={showExpiringSoon}
                    onCheckedChange={(checked) => setShowExpiringSoon(!!checked)}
                />
                <Label htmlFor="expiring-soon" className="whitespace-nowrap">Expiring Soon</Label>
                </div>
                <Input
                placeholder="Filter by product name..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full md:w-64"
                />
                <Button onClick={() => handleOpenSheet('addProduct')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
                </Button>
            </div>
            </CardHeader>
            <CardContent>
            <DataTable
                columns={columns}
                data={products || []}
                filterColumn="itemName"
                globalFilter={globalFilter}
                isLoading={isLoadingProducts}
            />
            </CardContent>
        </Card>
      )}

      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sheetMode === 'updateStock' && 'Update Stock'}
              {sheetMode !== 'updateStock' && `${sheetMode?.includes('edit') ? 'Edit' : 'Add'} Product`}
            </DialogTitle>
            <DialogDescription>
              {sheetMode === 'updateStock' 
                ? 'Enter the new total quantity for this item.' 
                : `Fill in the details for the product.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            { (sheetMode === 'addProduct' || sheetMode === 'editProduct') && 
              <ProductForm 
                onSubmit={(values) => productMutation.mutate({ item: values, id: (selectedItem as InventoryItem)?.id })} 
                initialData={selectedItem as InventoryItem | undefined}
                isPending={productMutation.isPending}
                categories={categories || []}
              />
            }
            { sheetMode === 'updateStock' &&
              <UpdateStockForm
                onSubmit={(values) => stockUpdateMutation.mutate({ values, id: (selectedItem as InventoryItem).id })}
                initialData={selectedItem as InventoryItem}
                isPending={stockUpdateMutation.isPending}
              />
            }
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 